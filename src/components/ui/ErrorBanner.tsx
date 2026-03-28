interface Props {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="flex items-start gap-3 bg-red-950 border border-red-700 text-red-200 rounded-xl p-4">
      <span className="text-red-400 mt-0.5 shrink-0">&#9888;</span>
      <p className="flex-1 text-sm">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-200 text-lg leading-none"
        >
          &times;
        </button>
      )}
    </div>
  );
}
