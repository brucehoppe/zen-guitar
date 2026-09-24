// site/render/practice.js
import { el, backLink } from "./dom.js";

const BELTS = [["white", "White belt"], ["practice", "Practice stage"], ["black", "Black belt"], ["barrier", "Barrier"]];

function trainsTags(lessonIds, lessons) {
  return lessonIds.flatMap((l, i) => {
    const lesson = lessons[l];
    const label = lesson?.label ?? l;
    const tag = lesson
      ? el("a", { class: "trains-tag", href: `#/${lesson.stage}/${lesson.section}` }, [label])
      : el("span", { class: "trains-tag" }, [label]);
    return i === 0 ? [tag] : [", ", tag];
  });
}

export function renderPractice(ctx) {
  const groups = BELTS.map(([belt, label]) => {
    const items = ctx.exercises.filter((e) => e.belt === belt);
    if (!items.length) return null;
    return el("section", { class: "sec" }, [
      el("h3", { class: "sec-h" }, [label]),
      el("ul", { class: "practice" }, items.map((e) => el("li", {}, [
        el("strong", {}, [e.name]), ": ", e.text, " ",
        ...trainsTags(e.lessons, ctx.lessons),
      ]))),
    ]);
  }).filter(Boolean);
  return el("article", { class: "view-inner" }, [
    backLink(ctx.lastStage),
    el("h2", { class: "stage-title", tabindex: "-1" }, ["Practice"]),
    el("p", { class: "stage-sub" }, ["The book gives almost no explicit exercises, but many of its images convert directly into practice. A rotating menu, not a checklist."]),
    ...groups,
  ]);
}
