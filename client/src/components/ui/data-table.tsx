import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    cell: (item: T) => React.ReactNode;
  }[];
}

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-neutral-100">
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-neutral-200">
          {data.map((item, itemIndex) => (
            <TableRow key={itemIndex}>
              {columns.map((column) => (
                <TableCell 
                  key={`${itemIndex}-${column.key}`}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface FeedbackRatingProps {
  percentage: number;
}

export function FeedbackRating({ percentage }: FeedbackRatingProps) {
  const getColorClass = (percent: number) => {
    if (percent >= 70) return "bg-green-500";
    if (percent >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center">
      <div className="w-16 bg-neutral-200 rounded-full h-2">
        <div 
          className={`${getColorClass(percentage)} h-2 rounded-full`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="ml-2 text-sm font-medium text-neutral-800">{percentage}%</span>
    </div>
  );
}
