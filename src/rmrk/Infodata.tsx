export function InfoData({ entries }) {
  return (
    <>
      <div className="grid grid-cols-4 xl:grid-cols-2 w-full">
        {Object.entries(entries).map(([label, value], i) => {
          return (
            <div key={`entry-${i}`} className="mb-4 pr-4">
              <div className="text-xs mb-1">{label}</div>
              <div className="dark:text-gray-400">{value}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
