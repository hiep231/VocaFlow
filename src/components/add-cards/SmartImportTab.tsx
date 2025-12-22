import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Card } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SmartImportTabProps {
  text: string;
  setText: (text: string) => void;
  parsedCards: Partial<Card>[];
  onUpdateType: (index: number, type: "vocab" | "grammar" | "sentence") => void;
}

export function SmartImportTab({
  text,
  setText,
  parsedCards,
  onUpdateType,
}: SmartImportTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-900 dark:text-indigo-200">
        <span className="font-bold text-indigo-700 dark:text-indigo-400">
          Format:
        </span>{" "}
        Term | Definition | IPA | Collocation | Example
      </div>

      <Textarea
        placeholder="Hello | Xin chào | /həˈloʊ/ | Say hello | Hello world"
        className="min-h-[200px] font-mono bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 focus:border-indigo-500 text-base p-4 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end">{/* Auto-previewing */}</div>

      {parsedCards.length > 0 && (
        <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead>IPA</TableHead>
                <TableHead>Collocation</TableHead>
                <TableHead>Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedCards.map((card, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={card.type || "vocab"}
                      onValueChange={(value) =>
                        onUpdateType(index, value as any)
                      }
                    >
                      <SelectTrigger className="h-8 w-28 text-xs font-bold border-2 border-neo-black shadow-neo-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vocab">Vocab</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="sentence">Sentence</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="font-bold text-indigo-600 dark:text-indigo-400">
                    {card.term}
                  </TableCell>
                  <TableCell className="dark:text-slate-300">
                    {card.definition}
                  </TableCell>
                  <TableCell className="font-mono text-xs dark:text-slate-500">
                    {card.ipa}
                  </TableCell>
                  <TableCell className="dark:text-slate-400">
                    {card.collocation}
                  </TableCell>
                  <TableCell className="italic dark:text-slate-400">
                    {card.example}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
