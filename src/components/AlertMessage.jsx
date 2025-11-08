export default function AlertMessage({ message, type }) {
  const colors = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <div className={`p-2 rounded-md text-center ${colors[type] || colors.info}`}>
      {message}
    </div>
  );
}