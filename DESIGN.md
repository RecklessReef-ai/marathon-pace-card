# Design notes

Who it is for: family and friends standing on a Chicago sidewalk in October, glancing at a phone in
sunlight, asking one question: when will my runner be here? Not runners, not designers.

## Tokens

Color (the Chicago flag, used as structure, not decoration)

| name  | hex     | job |
|-------|---------|-----|
| sky   | #41B6E6 | the flag's stripes and the map's water are the same blue; split signs; primary button |
| star  | #E4002B | the four stars, "your" spots, the "up next" mark. Nothing else is red |
| ink   | #0F2340 | all text and the route line; must read in sun |
| paper | #FFFFFF | the page and the bib |
| wash  | #EAF6FC | field tint for inputs and popular-zone rows only |

Dark mode flips paper and ink to the navy set already in `styles.css`; sky and star do not change.

Type

- Big Shoulders Display (600/800/900): the runner's name, every time, every distance, the map labels.
  Chosen because it is a typeface about Chicago and because it is tall and condensed like bib numerals.
- Barlow (400/500/600): everything that is a sentence.
- Scale: 17px body, 0.9rem small text (never lighter than `--muted` at that size), bib name 2.6rem,
  finish time 4rem, row time 1.6rem, row distance sign 1.2rem.

Layout

- Phone first, left aligned, numbers right aligned. One column until 860px, then map left, list right.
- The bib is the hero and the only rounded, bordered object with weight. Everything else is flat
  with rules: spot cards have a left rule in the group's color; split rows have a sign tile, no border.
- Sky stripes (8px) separate the three parts: card, spots, course.

Principles

1. Sun-readable beats pretty.
2. The flag is structure: stripes divide, blue is water, red is yours.
3. Numbers speak Big Shoulders, words speak Barlow.
4. Nothing moves unless race day moves it.

## Things tried and rejected

- A timeline rail down the list (v1). Read as generic and hid the kind of each row. Replaced by
  sign tiles: sky for official splits, red star for your spots, outlined diamond for popular zones.
- Form first, card second (v1). Spectators open the shared link already set up, so the card leads
  and the form folds away behind "Edit runner".
- Barlow Condensed for numbers. Fine but anonymous; Big Shoulders is specific to the city.
