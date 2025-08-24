export default function Loading() {
  // Konten loading tetap sama, hanya import Separator yang dihapus
  return (
    <main className="container mx-auto p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded-md dark:bg-gray-700"></div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-gray-200 rounded-md dark:bg-gray-700"></div>
          <div className="h-9 w-24 bg-gray-200 rounded-md dark:bg-gray-700"></div>
          <div className="h-9 w-24 bg-gray-200 rounded-md dark:bg-gray-700"></div>
          <div className="h-9 w-24 bg-gray-200 rounded-md dark:bg-gray-700"></div>
          <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Filter Section Skeleton */}
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg mb-4">
        <div className="h-9 w-[240px] bg-gray-200 rounded-md dark:bg-gray-700"></div>
        <div className="text-muted-foreground">-</div>
        <div className="h-9 w-[240px] bg-gray-200 rounded-md dark:bg-gray-700"></div>
        <div className="h-9 w-32 bg-gray-200 rounded-md dark:bg-gray-700"></div>
        <div className="h-9 w-24 bg-gray-200 rounded-md dark:bg-gray-700"></div>
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="h-10 px-2 text-left align-middle font-medium text-sm">
                <div className="h-4 w-20 bg-gray-200 rounded-md dark:bg-gray-700"></div>
              </th>
              <th className="h-10 px-2 text-left align-middle font-medium text-sm">
                <div className="h-4 w-48 bg-gray-200 rounded-md dark:bg-gray-700"></div>
              </th>
              <th className="h-10 px-2 text-right align-middle font-medium text-sm w-[170px]">
                <div className="h-4 w-20 bg-gray-200 rounded-md ml-auto dark:bg-gray-700"></div>
              </th>
              <th className="h-10 px-2 text-right align-middle font-medium text-sm w-[170px]">
                <div className="h-4 w-20 bg-gray-200 rounded-md ml-auto dark:bg-gray-700"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, index) => (
              <tr key={index} className="border-b last:border-b-0">
                <td className="p-2 h-[48px]">
                  <div className="h-4 w-20 bg-gray-200 rounded-md dark:bg-gray-700"></div>
                </td>
                <td className="p-2 h-[48px]" colSpan={3}>
                  <div className="h-4 w-64 bg-gray-200 rounded-md dark:bg-gray-700"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}