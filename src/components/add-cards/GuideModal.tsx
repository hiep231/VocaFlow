import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, BookOpen, Quote, FileText } from "lucide-react";
import { useState } from "react";

interface GuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuideModal({ open, onOpenChange }: GuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-white font-bold font-display">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Card Design Guide
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Best practices and templates for creating high-quality cards.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="structure"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="w-full justify-start bg-slate-100 dark:bg-slate-900 mx-1 border border-slate-200 dark:border-white/10">
            <TabsTrigger
              value="structure"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400"
            >
              <FileText className="w-4 h-4" />
              Card Structure
            </TabsTrigger>
            <TabsTrigger
              value="samples"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400"
            >
              <Quote className="w-4 h-4" />
              Smart Import Samples
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <TabsContent value="structure" className="mt-0 space-y-6">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold border-b border-indigo-100 dark:border-indigo-500/20 pb-2">
                  <span className="text-xl">A.</span> Vocabulary Card (Vocab) 📘
                </div>
                <div className="grid gap-2 text-sm">
                  <p>
                    <strong className="text-slate-900 dark:text-slate-200">
                      Focus:
                    </strong>{" "}
                    <span className="text-slate-600 dark:text-slate-400">
                      Mastering individual words or short phrases.
                    </span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Term:
                      </strong>{" "}
                      The word/phrase to learn (e.g.,{" "}
                      <em className="text-slate-900 dark:text-slate-200">
                        Epiphany
                      </em>
                      ).
                    </li>
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Definition:
                      </strong>{" "}
                      Clear explanation in target language.
                    </li>
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        IPA:
                      </strong>{" "}
                      Phonetic transcription (e.g.,{" "}
                      <em className="text-slate-900 dark:text-slate-200">
                        /ɪˈpɪf.ən.i/
                      </em>
                      ).
                    </li>
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Collocation:
                      </strong>{" "}
                      Common associations (e.g.,{" "}
                      <em className="text-slate-900 dark:text-slate-200">
                        have an epiphany
                      </em>
                      ).
                    </li>
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Example:
                      </strong>{" "}
                      Sentence showing usage in context.
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold border-b border-pink-100 dark:border-pink-500/20 pb-2">
                  <span className="text-xl">B.</span> Grammar Card (Grammar) 📐
                </div>
                <div className="grid gap-2 text-sm">
                  <p>
                    <strong className="text-slate-900 dark:text-slate-200">
                      Focus:
                    </strong>{" "}
                    <span className="text-slate-600 dark:text-slate-400">
                      Mastering sentence structures and rules.
                    </span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Term:
                      </strong>{" "}
                      Formula/Structure (e.g.,{" "}
                      <em className="text-slate-900 dark:text-slate-200">
                        S + wish + (that) + Past Perfect
                      </em>
                      ).
                    </li>
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Definition:
                      </strong>{" "}
                      Usage/Function (e.g.,{" "}
                      <em className="text-slate-900 dark:text-slate-200">
                        Expressing regret about past situations
                      </em>
                      ).
                    </li>
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Example:
                      </strong>{" "}
                      Complete sentence applying the rule.
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold border-b border-cyan-100 dark:border-cyan-500/20 pb-2">
                  <span className="text-xl">C.</span> Sentence Card (Sentence)
                  💬
                </div>
                <div className="grid gap-2 text-sm">
                  <p>
                    <strong className="text-slate-900 dark:text-slate-200">
                      Focus:
                    </strong>{" "}
                    <span className="text-slate-600 dark:text-slate-400">
                      Mastering idioms or expressions.
                    </span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Term:
                      </strong>{" "}
                      Full sentence/idiom (e.g.,{" "}
                      <em className="text-slate-900 dark:text-slate-200">
                        It's raining cats and dogs
                      </em>
                      ).
                    </li>
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Definition:
                      </strong>{" "}
                      Functional meaning.
                    </li>
                    <li>
                      <strong className="text-slate-700 dark:text-slate-300">
                        Example:
                      </strong>{" "}
                      Conversational context.
                    </li>
                  </ul>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="samples" className="mt-0 space-y-6">
              <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 p-4 rounded-lg text-sm mb-4 border border-amber-200 dark:border-amber-500/20">
                <strong>Tip:</strong> Click the copy button and paste directly
                into the <strong>Smart Import</strong> tab.
              </div>

              <SampleBlock
                title="📋 Mixed Types (Vocab & Grammar)"
                content={`Serendipity | The occurrence of events by chance in a happy or beneficial way | /ˌser.ənˈdɪp.ə.ti/ | Pure serendipity | Finding that book was pure serendipity.
Resilience | The capacity to recover quickly from difficulties | /rɪˈzɪl.jəns/ | Build resilience | He showed great resilience after the accident.
To be over the moon | To be extremely happy and excited | /ˌoʊ.vɚ ðə ˈmuːn/ | Be over the moon about | She was over the moon about her new job.
S + would rather + (that) + S + V(past) | Expressing a preference for someone else's action | /wʊd ˈræð.ər/ | - | I would rather you didn't smoke in here.`}
              />

              <SampleBlock
                title="🧠 Grammar Focus"
                content={`S + V + too + adj/adv + (for O) + to V | Structure indicating excess preventing an action | /tuː ... tuː/ | Too structure | The coffee is too hot for me to drink.
It is time + S + V(past) | Expressing that something should have been done already | /ɪts taɪm/ | Subjunctive mood | It is time we went home.
No sooner + had + S + V3 + than + S + V(past) | One event happening immediately after another | /noʊ ˈsuː.nər/ | Inversion | No sooner had I arrived than the phone rang.`}
              />

              <SampleBlock
                title="💬 Functional English"
                content={`Could you do me a favor? | Requesting help politely | /feɪ.vər/ | Request pattern | Could you do me a favor and open the window?
I'm afraid I can't make it. | Politely declining an invitation | /əˈfreɪd/ | Declining | "Are you coming to the party?" "I'm afraid I can't make it."
Let's call it a day. | Suggesting to stop working | /kɔːl ɪt ə deɪ/ | Work idioms | We've done enough. Let's call it a day.`}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SampleBlock({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
          {title}
        </h4>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs overflow-x-auto font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}
