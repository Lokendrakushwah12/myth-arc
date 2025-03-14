import { ColorSelector } from "@/components/editor/selectors/color-selector";
import { LinkSelector } from "@/components/editor/selectors/link-selector";
import { MathSelector } from "@/components/editor/selectors/math-selector";
import { NodeSelector } from "@/components/editor/selectors/node-selector";
import { TextButtons } from "@/components/editor/selectors/text-buttons";
import { Separator } from "@/components/ui/separator";
import type { JSONContent as TiptapJSONContent } from "@tiptap/core";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { handleImageDrop, handleImagePaste } from "novel/plugins";
import { useEffect, useState } from "react";
import EditorMenu from "./editor-menu";
import { defaultExtensions } from "./extensions";
import { uploadFn } from "./image-upload";
import { slashCommand, suggestionItems } from "./slash-command";

const extensions = [...defaultExtensions, slashCommand];

export const defaultEditorContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

interface EditorProps {
  initialValue?: TiptapJSONContent;
  onChange: (content: TiptapJSONContent) => void;
}

export default function Editor({ initialValue, onChange }: EditorProps) {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [editorContent, setEditorContent] =
    useState<JSONContent>(defaultEditorContent);

  useEffect(() => {
    if (initialValue) {
      setEditorContent(initialValue);
    }
  }, [initialValue]);

  const isContentEmpty = (content: JSONContent) => {
    if (
      content?.content?.[0]?.content?.[0]?.text?.length &&
      content?.content?.[0]?.content?.[0]?.text?.length > 0
    )
      return false;
    else if (content?.content?.length && content?.content?.length > 1)
      return false;
    return true;
  };

  const handleEditorUpdate = ({ editor }: { editor: EditorInstance }) => {
    const content = editor.getJSON();
    setEditorContent(content);
    onChange(content);
  };

  return (
    <div className="relative w-full text-muted-foreground">
      <EditorRoot>
        {isContentEmpty(editorContent) && (
          <div className="pointer-events-none absolute text-muted-foreground">
            Press &apos;/&apos; for commands
          </div>
        )}
        <EditorContent
          immediatelyRender={false}
          initialContent={editorContent}
          extensions={extensions}
          className="min-h-96"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={handleEditorUpdate}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <EditorMenu open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorMenu>
        </EditorContent>
      </EditorRoot>
    </div>
  );
}
