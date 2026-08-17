"""scripts/convert-restaurants.py のunittestテスト。

python3 -m unittest scripts.test_convert_restaurants -v
または
python3 scripts/test_convert_restaurants.py
で実行できる。
"""

from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

import openpyxl

MODULE_PATH = Path(__file__).resolve().parent / "convert-restaurants.py"
_spec = importlib.util.spec_from_file_location("convert_restaurants", MODULE_PATH)
assert _spec is not None and _spec.loader is not None
convert_restaurants = importlib.util.module_from_spec(_spec)
sys.modules["convert_restaurants"] = convert_restaurants
_spec.loader.exec_module(convert_restaurants)

REAL_EXCEL_PATH = convert_restaurants.EXCEL_PATH

INTERNAL_ONLY_FIELDS = {
    "sourceUrl",
    "sourceType",
    "trust",
    "publishable",
    "追加者",
}


def make_workbook(header: list[str], rows: list[list]) -> Path:
    """一時ファイルへ最小構成のワークブックを書き出してパスを返す。"""
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = convert_restaurants.SHEET_NAME
    sheet.append(header)
    for row in rows:
        sheet.append(row)
    tmp = tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False)
    workbook.save(tmp.name)
    return Path(tmp.name)


class NormalizeOptionalTests(unittest.TestCase):
    def test_none_and_blank_and_kakunin_become_none(self) -> None:
        self.assertIsNone(convert_restaurants.normalize_optional(None))
        self.assertIsNone(convert_restaurants.normalize_optional(""))
        self.assertIsNone(convert_restaurants.normalize_optional("要確認"))

    def test_value_is_trimmed(self) -> None:
        self.assertEqual(convert_restaurants.normalize_optional("  京急蒲田  "), "京急蒲田")


class TriStateTests(unittest.TestCase):
    def test_maru_and_nimaru_are_true(self) -> None:
        self.assertTrue(convert_restaurants.tri_state("○（7:30〜）"))
        self.assertTrue(convert_restaurants.tri_state("◎（翌4時）"))

    def test_batsu_is_false(self) -> None:
        self.assertIs(convert_restaurants.tri_state("×（別館は金・祝前日 翌5時まで）"), False)

    def test_kakunin_blank_none_are_null(self) -> None:
        self.assertIsNone(convert_restaurants.tri_state("要確認"))
        self.assertIsNone(convert_restaurants.tri_state(""))
        self.assertIsNone(convert_restaurants.tri_state(None))

    def test_sotei_only_is_null_even_if_starts_with_maru(self) -> None:
        self.assertIsNone(convert_restaurants.tri_state("○想定"))

    def test_sankaku_is_null_not_true(self) -> None:
        self.assertIsNone(convert_restaurants.tri_state("△（〜24時）"))


class ParseCrewSummaryTests(unittest.TestCase):
    def test_splits_and_strips_leading_dot(self) -> None:
        raw = "・羽根つき餃子が名物\n・パリパリ食感\n・安くて満足度が高い"
        self.assertEqual(
            convert_restaurants.parse_crew_summary(raw),
            ["羽根つき餃子が名物", "パリパリ食感", "安くて満足度が高い"],
        )

    def test_none_and_empty_become_empty_list(self) -> None:
        self.assertEqual(convert_restaurants.parse_crew_summary(None), [])
        self.assertEqual(convert_restaurants.parse_crew_summary(""), [])


class IsDrinkSpotTests(unittest.TestCase):
    def test_matches_keyword(self) -> None:
        self.assertTrue(convert_restaurants.is_drink_spot("やきとん・居酒屋"))
        self.assertTrue(convert_restaurants.is_drink_spot("バー・パブ"))

    def test_no_match(self) -> None:
        self.assertFalse(convert_restaurants.is_drink_spot("イタリアン"))


class ClassifyPublishTests(unittest.TestCase):
    def test_low_trust_excluded(self) -> None:
        self.assertIn("信頼度が△のため非公開", convert_restaurants.classify_publish("△", "営業中"))

    def test_closed_excluded(self) -> None:
        reasons = convert_restaurants.classify_publish("◎", "閉店")
        self.assertTrue(any("閉店" in r for r in reasons))

    def test_business_status_unconfirmed_excluded(self) -> None:
        reasons = convert_restaurants.classify_publish("○", "営業状況要確認")
        self.assertTrue(any("営業状況要確認" in r for r in reasons))

    def test_hours_unconfirmed_is_not_excluded(self) -> None:
        self.assertEqual(convert_restaurants.classify_publish("◎", "営業中（営業時間要確認）"), [])

    def test_normal_open_is_published(self) -> None:
        self.assertEqual(convert_restaurants.classify_publish("◎", "営業中"), [])


class BuildTagsTests(unittest.TestCase):
    def test_emoji_and_derived_tags(self) -> None:
        features = {
            "breakfast": True,
            "lateNight": True,
            "solo": None,
            "walkable": None,
            "takeout": True,
            "cashless": None,
            "quick": None,
            "drink": True,
        }
        tags = convert_restaurants.build_tags(features, "🌙👤🚶")
        self.assertIn("breakfast", tags)
        self.assertIn("lateNight", tags)
        self.assertIn("solo", tags)
        self.assertIn("walkable", tags)
        self.assertIn("takeout", tags)
        self.assertIn("drink", tags)
        self.assertNotIn("cashless", tags)
        self.assertNotIn("quick", tags)
        self.assertNotIn("earlyMorning", tags)

    def test_early_morning_tag_from_emoji(self) -> None:
        features = {
            "breakfast": None,
            "lateNight": None,
            "solo": None,
            "walkable": None,
            "takeout": None,
            "cashless": None,
            "quick": None,
            "drink": False,
        }
        tags = convert_restaurants.build_tags(features, "🍳")
        self.assertIn("earlyMorning", tags)


class SyntheticWorkbookTests(unittest.TestCase):
    """構造的エラー（列欠落・重複・必須値欠落）を人工データで検証する。"""

    def setUp(self) -> None:
        self._temp_files: list[Path] = []

    def tearDown(self) -> None:
        for path in self._temp_files:
            path.unlink(missing_ok=True)

    def _make(self, header: list[str], rows: list[list]) -> Path:
        path = make_workbook(header, rows)
        self._temp_files.append(path)
        return path

    def test_missing_required_column_stops_conversion(self) -> None:
        path = self._make(
            ["No", "店名", "空港", "エリア"],  # ジャンル列が欠落
            [[1, "テスト店", "羽田", "蒲田"]],
        )
        with self.assertRaises(convert_restaurants.ConversionError):
            convert_restaurants.convert(path)

    def test_duplicate_id_is_detected(self) -> None:
        header = ["No", "店名", "空港", "エリア", "ジャンル", "信頼度", "ステータス"]
        path = self._make(
            header,
            [
                [1, "店A", "羽田", "蒲田", "洋食", "◎", "営業中"],
                [1, "店B", "羽田", "蒲田", "中華", "◎", "営業中"],
            ],
        )
        with self.assertRaises(convert_restaurants.ConversionError):
            convert_restaurants.convert(path)

    def test_duplicate_name_and_area_is_detected(self) -> None:
        header = ["No", "店名", "空港", "エリア", "ジャンル", "信頼度", "ステータス"]
        path = self._make(
            header,
            [
                [1, "同じ店", "羽田", "蒲田", "洋食", "◎", "営業中"],
                [2, "同じ店", "羽田", "蒲田", "中華", "◎", "営業中"],
            ],
        )
        with self.assertRaises(convert_restaurants.ConversionError):
            convert_restaurants.convert(path)

    def test_missing_required_value_stops_conversion(self) -> None:
        header = ["No", "店名", "空港", "エリア", "ジャンル", "信頼度", "ステータス"]
        path = self._make(
            header,
            [[1, None, "羽田", "蒲田", "洋食", "◎", "営業中"]],
        )
        with self.assertRaises(convert_restaurants.ConversionError):
            convert_restaurants.convert(path)

    def test_explicit_drink_column_overrides_genre(self) -> None:
        """「飲み」列の○はジャンル非該当でもdrink付与、×は居酒屋でも不付与、空欄は従来通り。"""
        header = ["No", "店名", "空港", "エリア", "ジャンル", "信頼度", "ステータス", "飲み"]
        path = self._make(
            header,
            [
                [1, "もつ鍋店", "福岡", "赤坂", "もつ鍋", "◎", "営業中", "○"],
                [2, "定食居酒屋", "福岡", "天神", "居酒屋", "◎", "営業中", "×"],
                [3, "普通の居酒屋", "福岡", "博多", "居酒屋", "◎", "営業中", None],
            ],
        )
        report = convert_restaurants.convert(path)
        by_id = {r["id"]: r for r in report.published}
        self.assertTrue(by_id["1"]["features"]["drink"])
        self.assertIn("drink", by_id["1"]["tags"])
        self.assertFalse(by_id["2"]["features"]["drink"])
        self.assertNotIn("drink", by_id["2"]["tags"])
        self.assertTrue(by_id["3"]["features"]["drink"])

    def test_valid_minimal_row_is_published(self) -> None:
        header = ["No", "店名", "空港", "エリア", "ジャンル", "信頼度", "ステータス", "タグ"]
        path = self._make(
            header,
            [[1, "テスト店", "羽田", "蒲田", "居酒屋", "◎", "営業中", "🚶"]],
        )
        report = convert_restaurants.convert(path)
        self.assertEqual(len(report.published), 1)
        self.assertEqual(len(report.excluded), 0)
        restaurant = report.published[0]
        self.assertEqual(restaurant["id"], "1")
        self.assertTrue(restaurant["features"]["drink"])
        self.assertIn("walkable", restaurant["tags"])
        self.assertEqual(restaurant["mapQuery"], "テスト店 蒲田 羽田")


@unittest.skipUnless(REAL_EXCEL_PATH.exists(), "data/crew-gourmet-master.xlsx がローカルにありません")
class RealMasterExcelTests(unittest.TestCase):
    """実データ（52行・2026-07-29マスター）に対する結合テスト。"""

    @classmethod
    def setUpClass(cls) -> None:
        cls.report = convert_restaurants.convert()

    def test_reads_52_rows(self) -> None:
        self.assertEqual(self.report.total_rows, 52)

    def test_publish_and_exclusion_counts(self) -> None:
        self.assertEqual(len(self.report.published), 45)
        self.assertEqual(len(self.report.excluded), 7)

    def test_exclusion_reasons_breakdown(self) -> None:
        low_trust = [e for e in self.report.excluded if any("信頼度" in r for r in e.reasons)]
        status_unconfirmed = [
            e for e in self.report.excluded if any("営業状況要確認" in r for r in e.reasons)
        ]
        self.assertEqual(len(low_trust), 1)
        self.assertEqual(len(status_unconfirmed), 6)

    def test_unofficial_hours_note_for_jet_lag_club(self) -> None:
        """公式未確認の営業時間は内部注記を除去し、公開用の注意文を付ける（2026-07-20）。"""
        self.assertEqual(self.report.hours_unofficial_ids, ["7", "14", "15"])
        jet_lag = next(r for r in self.report.published if r["id"] == "7")
        self.assertEqual(jet_lag["hours"], "16:00〜翌2:00")
        self.assertNotIn("公式未確認", jet_lag["hours"])
        self.assertEqual(
            jet_lag["statusNote"],
            "営業時間は変更される場合があります。来店前に最新情報をご確認ください。",
        )
        self.assertIn("lateNight", jet_lag["tags"])

    def test_hours_hidden_for_uncertain_status(self) -> None:
        # 2026-07-20: No.7 Jet Lag Clubの営業時間が判明したため4→3件
        # （残りはNo.15バーパドレ・No.24うみの家・No.31ぐらっちぇ）
        self.assertEqual(len(self.report.hours_hidden_ids), 2)
        for restaurant in self.report.published:
            if restaurant["id"] in self.report.hours_hidden_ids:
                self.assertIsNone(restaurant["hours"])
                self.assertEqual(restaurant["statusNote"], "営業時間は最新情報をご確認ください")

    def test_no_internal_fields_leak_into_public_json(self) -> None:
        for restaurant in self.report.published:
            keys = set(restaurant.keys())
            leaked = keys & INTERNAL_ONLY_FIELDS
            self.assertFalse(leaked, f"内部項目が公開JSONに含まれています: {leaked}")
            self.assertNotIn("raw", restaurant.get("status", {}) if isinstance(restaurant.get("status"), dict) else {})

    def test_crew_summary_is_list_of_strings(self) -> None:
        for restaurant in self.report.published:
            self.assertIsInstance(restaurant["crewSummary"], list)
            for item in restaurant["crewSummary"]:
                self.assertIsInstance(item, str)
                self.assertFalse(item.startswith("・"))

    def test_early_morning_tag_only_on_sukesan(self) -> None:
        """earlyMorning（🍳）は24時間営業を公式確認したNo.47資さんうどん博多千代店のみ。"""
        ids = [r["id"] for r in self.report.published if "earlyMorning" in r["tags"]]
        self.assertEqual(ids, ["47"])


if __name__ == "__main__":
    unittest.main()
