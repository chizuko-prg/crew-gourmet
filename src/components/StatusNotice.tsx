import "./StatusNotice.css";

interface StatusNoticeProps {
  message: string;
}

export function StatusNotice({ message }: StatusNoticeProps) {
  return (
    <p className="status-notice" role="note">
      {message}
    </p>
  );
}
