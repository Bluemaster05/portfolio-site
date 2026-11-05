"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/rich-text/RichTextEditor";
import { TopicTabs } from "@/components/rich-text/TopicTabs";
import {
  docFromTopics,
  EMPTY_DOC,
  isEmptyDoc,
  toDoc,
  topicsOf,
  type RichTextValue,
  type Topic,
} from "@/components/rich-text/types";
import type { UploadMedia } from "@/lib/admin/media";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button, TextInput } from "./ui";

interface WriteupFieldProps {
  label: string;
  value: unknown;
  onChange: (doc: RichTextValue) => void;
  onUpload: UploadMedia;
}

/**
 * A write-up: one document, or two or more titled topics shown as tabs on the page. Adding topics
 * turns the current write-up into the first one; deleting down to one turns it back.
 */
export function WriteupField({
  label,
  value,
  onChange,
  onUpload,
}: WriteupFieldProps) {
  const topics = topicsOf(value);
  // Editors keep their own state, so each topic has a key that follows it when topics move
  const [keys, setKeys] = useState<number[]>(() =>
    (topics ?? []).map((_, index) => index),
  );
  const [active, setActive] = useState(0);
  // Topic waiting on "Are you sure?" before it's deleted
  const [confirming, setConfirming] = useState<number>();

  function change(next: Topic[], nextKeys: number[], nextActive = active) {
    onChange(docFromTopics(next));
    setKeys(next.length > 1 ? nextKeys : []);
    setActive(next.length > 1 ? nextActive : 0);
  }

  const newKey = () => Math.max(-1, ...keys) + 1;

  if (!topics || topics.length < 2) {
    const doc = topics?.[0].doc ?? toDoc(value);
    return (
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() =>
              change(
                [
                  { title: "Overview", doc },
                  { title: "New topic", doc: EMPTY_DOC },
                ],
                [0, 1],
                1,
              )
            }
          >
            Switch to topic-based write-up
          </Button>
          <p className="text-xs text-muted">
            Splits the write-up into topics, shown as tabs. What’s written here
            becomes the first one.
          </p>
        </div>
        <RichTextEditor
          label={label}
          value={doc}
          onChange={onChange}
          onUpload={onUpload}
        />
      </div>
    );
  }

  const update = (index: number, patch: Partial<Topic>) =>
    change(
      topics.map((topic, i) => (i === index ? { ...topic, ...patch } : topic)),
      keys,
    );

  const move = (index: number, step: number) => {
    const to = index + step;
    const swap = <T,>(list: T[]) =>
      list.map((item, i) =>
        i === index ? list[to] : i === to ? list[index] : item,
      );
    change(swap(topics), swap(keys), to);
  };

  const remove = (index: number) => {
    setConfirming(undefined);
    change(
      topics.filter((_, i) => i !== index),
      keys.filter((_, i) => i !== index),
      Math.max(0, index - 1),
    );
  };

  // Topics with something written in them ask first
  const requestRemove = (index: number) =>
    isEmptyDoc(topics[index].doc) ? remove(index) : setConfirming(index);

  const confirmingName =
    confirming === undefined
      ? undefined
      : topics[confirming]?.title.trim() || "Untitled";

  return (
    <>
      <ConfirmDialog
        message={
          confirmingName &&
          `Delete the topic “${confirmingName}”? What’s written in it will be lost once you save.`
        }
        confirmLabel="Delete topic"
        onConfirm={() => confirming !== undefined && remove(confirming)}
        onCancel={() => setConfirming(undefined)}
      />
      <TopicTabs
        label={`${label} topics`}
        active={active}
        onSelect={setActive}
        actions={
          <Button
            variant="ghost"
            className="ml-1 whitespace-nowrap"
            onClick={() =>
              change(
                [...topics, { title: "New topic", doc: EMPTY_DOC }],
                [...keys, newKey()],
                topics.length,
              )
            }
          >
            + Add topic
          </Button>
        }
        tabs={topics.map((topic, index) => ({
          key: keys[index],
          title: topic.title,
          panel: (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-end gap-2">
                <label className="grid min-w-48 flex-1 gap-1.5 text-sm font-medium">
                  Topic title
                  <TextInput
                    maxLength={80}
                    value={topic.title}
                    onChange={(event) =>
                      update(index, { title: event.target.value })
                    }
                  />
                </label>
                <Button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move topic left"
                >
                  ←
                </Button>
                <Button
                  onClick={() => move(index, 1)}
                  disabled={index === topics.length - 1}
                  aria-label="Move topic right"
                >
                  →
                </Button>
                <Button variant="danger" onClick={() => requestRemove(index)}>
                  Delete topic
                </Button>
              </div>
              <RichTextEditor
                label={`${label}: ${topic.title.trim() || "Untitled"}`}
                value={topic.doc}
                onChange={(doc) => update(index, { doc: toDoc(doc) })}
                onUpload={onUpload}
              />
              {topics.length === 2 && (
                <p className="text-xs text-muted">
                  Delete a topic to go back to a single write-up without tabs.
                </p>
              )}
            </div>
          ),
        }))}
      />
    </>
  );
}
