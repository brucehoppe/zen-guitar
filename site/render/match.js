import { el, svg, heading } from "./dom.js";
import { lessonHref } from "../router.js";

// Original line drawings; visible captions carry the meaning.
const drawings = {
  "empty-cup": "M18 35h38l-5 24H24z M56 38c19-5 18 18-3 15 M13 64h49 M28 27c-9-9 8-9 0-18 M44 27c-9-9 8-9 0-18 M17 39c-10 0-10 17-4 21",
  discipline: "M29 49c0-10-10-13-10-25a21 21 0 0 1 42 0c0 12-10 15-10 25z M29 55h22 M32 61h16 M36 67h8 M40 3v-3 M10 14l-7-4 M70 14l7-4",
  rhythm: "M12 41l10-20 5 2-4 18 9-24 5 2-6 25 10-19 5 3-7 24c-4 14-20 13-25 4z M68 41l-10-20-5 2 4 18-9-24-5 2 6 25-10-19-5 3 7 24c4 14 20 13 25 4z",
  detail: "M9 31a24 24 0 0 1 48 0z M33 7v46q0 14-10 8 M45 61h23v-9l-12-5-4 8h-7z",
  collaboration: "M31 39a12 12 0 1 0 24 0a12 12 0 1 0-24 0 M9 15a8 8 0 1 0 16 0a8 8 0 1 0-16 0 M60 16a8 8 0 1 0 16 0a8 8 0 1 0-16 0 M24 21l10 9 M62 23l-10 9",
  "letting-go": "M14 18l26 7 26-7v30l-26 8-26-8z M40 25v31 M12 66l10-4 9 5 10-4 10 4 15-5 M25 59l-3-7 M52 60l3-7",
  decide: "M5 13q30 9 69-4 M40 15v13 M35 34a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M40 39v17 M40 45l-13 8 M40 45l14 8 M40 56l-10 15 M40 56l12 15",
  jamming: "M12 38h56q-3 26-28 26T12 38 M18 70h44 M53 8l13 6-12 22-12-6z M45 36l-3 6 M27 31c-7-7 7-9 0-16",
  "follow-through": "M13 72c0-25 48-16 48-38S30 22 39 2 M37 70l2-5 M47 57l5-4 M62 44l2-5 M55 23l-5-3 M40 12v-5",
  silence: "M9 57l53-40 7 9-53 40z M27 49l2 2 M36 42l2 2 M45 35l2 2 M54 28l2 2 M68 9q8-5 9 4",
};
export function renderMatch(section, ctx) {
  // Preserve the original anchor for previously shared links.
  return el("section", { class: "sec sec-connections", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("p", { class: "muted" }, ["Images to return to. Open any connection and follow it at your own pace."]),
    el("p", { class: "small muted" }, ["The images come from the study guide; the guitar examples are original companion reflections."]),
    ...section.items.map((item) => {
      const lesson = ctx.lessons[item.lesson];
      return el("details", { class: "teaching connection", "data-lesson": item.lesson }, [
        el("summary", {}, [
          svg("svg", { viewBox: "0 0 80 80", class: "connection-drawing", "aria-hidden": "true", focusable: "false" }, [
            svg("path", { d: drawings[item.lesson] || drawings["empty-cup"] }),
          ]),
          el("span", {}, [item.image]),
        ]),
        el("p", {}, [item.meaning]),
        lesson ? el("a", { href: lessonHref(lesson, ctx.again) }, [`Read about ${lesson.label.toLowerCase()}`]) : null,
      ]);
    }),
  ]);
}
