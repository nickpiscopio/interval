# 50. Optical Input Label Gap

We decided to establish a dedicated semantic spacing token `Spacing.inputLabelGap` (4px, matching `Spacing.xs`) for the vertical margin between Input Labels and their interactive controls, form fields, or selector palettes, rather than using the generic `Spacing.sm` (8px) or un-anchored arbitrary gaps.

While standard 8px spacing (`Spacing.sm`) between 12px `Poppins-Bold` field labels and input borders creates excessive optical separation due to font ascent/descent leading and row alignment, an optical 4px gap (`Spacing.xs`) creates a tight, unified typographic pairing identical to the Timer Details form. Codifying `Spacing.inputLabelGap: 4` (anchored to `Spacing.xs`) as a semantic token maintains strict token enforcement and preserves the clean 8pt/4pt base grid while standardizing optical label-to-control grouping across all forms, modals, and bottom sheets.
