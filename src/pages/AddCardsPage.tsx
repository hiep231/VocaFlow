import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Table as TableIcon,
  Sparkles,
  ArrowLeft,
  Save,
  BookOpen, // New Icon
} from "lucide-react";
import { useAddCards } from "@/hooks/useAddCards";
import { SmartImportTab } from "@/components/add-cards/SmartImportTab";
import { ManualImportTab } from "@/components/add-cards/ManualImportTab";
import { GuideModal } from "@/components/add-cards/GuideModal"; // New Import
import { useState } from "react"; // New Import

export default function AddCardsPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [isGuideOpen, setIsGuideOpen] = useState(false); // New State

  const {
    activeTab,
    setActiveTab,
    text,
    setText,
    parsedCards,
    manualCards,
    isSubmitting,
    updateParsedCardType,
    addManualRow,
    removeManualRow,
    updateManualCard,
    handleSave,
  } = useAddCards(deckId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30 pb-20 md:pb-0">
      {/* Background Effects */}
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[60%] bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal animate-pulse-slow z-0" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[60%] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal animate-pulse-slow delay-1000 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to={`/decks/${deckId}`}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                Add New Cards
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Expand your vocabulary deck
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setIsGuideOpen(true)}
              className="hidden md:flex gap-2"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Guide
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/decks/${deckId}`)}
              className="flex-1 md:flex-none"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 md:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20"
              disabled={
                isSubmitting ||
                (activeTab === "smart" && parsedCards.length === 0) ||
                (activeTab === "manual" && manualCards.length === 0)
              }
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save{" "}
                  {activeTab === "smart"
                    ? parsedCards.length
                    : manualCards.length}{" "}
                  Cards
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col gap-6"
          >
            <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger
                value="smart"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-white"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Smart Import
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-white"
              >
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4" />
                  Manual Entry
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="smart">
              {/* Mobile Guide Button */}
              <div className="md:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setIsGuideOpen(true)}
                  className="w-full gap-2"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  How to format?
                </Button>
              </div>

              <SmartImportTab
                text={text}
                setText={setText}
                parsedCards={parsedCards}
                onUpdateType={updateParsedCardType}
              />
            </TabsContent>

            <TabsContent value="manual">
              <ManualImportTab
                manualCards={manualCards}
                onUpdateCard={updateManualCard}
                onRemoveRow={removeManualRow}
                onAddRow={addManualRow}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <GuideModal open={isGuideOpen} onOpenChange={setIsGuideOpen} />
    </div>
  );
}
