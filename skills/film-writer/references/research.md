# Research and sourcing

Why two sources: a single source cannot be checked, and numbers drift between sources in unit, period, place or who counted. Ids: `external` = `research/external-skills.md` Writer section (research always, never narrate it, two sources per number, a vague true line beats a specific false one); `craft §2.7` = `research/craft.md` (Joss Fong, Vox: a script editor flags what the ear cannot follow).

## Where to look

1. Local first. When the overlay names a library or database (works, texts, commentaries, a lexicon), query it before the web: it is the project's own corpus and usually carries the edition.
2. Web: primary sources (the document, letter, register, inscription, the edition itself), scholarly pages (university presses, journals, encyclopaedias with named scholarly authors), institutional pages (libraries, museums, archives, the bodies that own the subject).
3. Never a content farm, listicle, "top facts" site, quote aggregator, forum, social post or AI-generated answer, not even as the second source.
4. Prefer the oldest reliable witness for what was said or done and the newest scholarship for what it meant. If they disagree, the disagreement is the finding.

## Keeping the sources

Every source opened is saved in the film as it is read, so a later change, a client review or a
re-check reads the file instead of researching again. Before any search, read `<film>/sources/`:
a source already there is not fetched again.

- `<film>/sources/<id>.md`, one per source (`id` a short kebab slug, e.g. `luther-95-theses-1517`):
  title, author, date, edition or publisher, URL or library id, accessed date, kind (`primary`,
  `scholarly`, `institutional`, `lexicon`, `local library`), licence (`public domain`, or
  `copyrighted: excerpts only`); then every passage relied on, verbatim, original language, with
  page, section or line, and the claim ids (`C07`) and script lines (`L12`) it backs. A public-domain
  or short text keeps the whole relevant section, not just the quoted sentence. A local-library
  lookup keeps its query and result rows.
- A downloaded file (PDF, page scan) sits beside it as `<film>/sources/<id>.<ext>`.
- The folder is working material, not part of the film: the overlay says whether the project keeps
  it in version control or only on the machine.
- `<film>/sources/README.md`: one row per source (`id`, title, kind, URL, claims, file).
- `crew/research.md` cites sources by `id`. Writer and fact-checker share the folder: same document,
  same `id`; each adds the passages it read.

## Two sources

5. Every fact that reaches the spoken text has two independent sources. Independent = neither cites the other and neither copies the same upstream page.
6. A number is pinned to four things in both sources: unit (copies, editions, titles, people), period (days, weeks, years), place, and who counted. If either source differs on any of the four, the claim is not confirmed as written: restate it at the level both support, or drop it.
7. A source that gives a number with no method or origin ("historians say", "it is estimated") counts as half a source.
8. A vague true line beats a specific false one. If only the vague form is double-sourced ("within weeks, through much of the country"), write that.

## Quotes

9. Quote verbatim, in the source's own language and spelling; record edition or page and URL or library id. A translation is labelled with its translator or edition; your own translation is labelled as such with the original beside it.
10. A spoken quotation is the shortest span that carries the point. Ellipses only where the source is unchanged on both sides.
11. Attribution to a famous person: find the earliest source that has them saying it. A line first printed generations later is a legend: say so, or drop it (worked example: `examples.md`, claim C02).

## Claims from the brief or the client

12. A fact from the brief or the client is logged `origin: client` and checked exactly like a found fact. A good hook does not lower the bar.
13. Split a compound claim ("N copies in two weeks across the whole country") into parts and check each: often the parts are true and the combination is not.
14. A claim that fails goes back to the Director with what the sources do say and the replacement; do not just remove it.

## Facts the grammar makes you carry

15. Every number that will become a count-in-steps (`playbook.md` W6) has its start value and end value double-sourced; steps in between are either sourced points (a value per year) or labelled as an animated counter.
16. A date or one-line fact that will become a breath-card line (`playbook.md` W5) is sourced like any other line; shortness does not exempt it.

## `crew/research.md` shape

One block per claim:

```
## C07 - <the claim as the script states it>
origin: found | client | brief            verdict: confirmed | restated | dropped | unverified
used in: script line L12

- Source A [`<source id>`]: <author/body>, <title>, <edition/page or URL>, <accessed date>. Type: primary | scholarly | institutional | local library.
  > "<verbatim quote, original language>"
- Source B: ... same fields ...
  > "..."
- Pins: unit <...> / period <...> / place <...> / counted by <...>  (same in A and B: yes/no)
- Note: <what differs, what was restated, why dropped>
```

A `dropped` or `unverified` claim never appears in the spoken text. The sources list in `script.md` is built from `confirmed` and `restated` blocks only.
