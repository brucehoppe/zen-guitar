// site/render/practice.js
import { el, backLink } from "./dom.js";
import { lessonHref } from "../router.js";

const BELTS = [["white", "White belt"], ["practice", "Practice stage"], ["black", "Black belt"], ["barrier", "Barrier"]];

function trainsTags(lessonIds, lessons, again) {
  return lessonIds.flatMap((l, i) => {
    const lesson = lessons[l];
    const label = lesson?.label ?? l;
    const tag = lesson
      ? el("a", { class: "trains-tag", href: lessonHref(lesson, again) }, [label])
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
        ...trainsTags(e.lessons, ctx.lessons, ctx.again),
      ]))),
    ]);
  }).filter(Boolean);
  return el("article", { class: "view-inner" }, [
    backLink(ctx.lastStage),
    el("h2", { class: "stage-title", tabindex: "-1" }, ["Practice"]),
    el("p", { class: "stage-sub" }, ["Invitations drawn from the book’s images. Choose something that speaks to you, and give it whatever space you wish."]),
    ...groups,
  ]);
}
