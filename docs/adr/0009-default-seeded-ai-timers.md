# 9. Default Seeded AI Timers and AI Badge Indicator

We decided to seed 5 curated workout timers with fun, whimsical names (e.g., "Couch to Comet 🚀", "Abs-olutely Fabulous ✨", "Sweaty Spaghetti 🍝", "Biceps & Bagels 🥯", "Gravity Who? 🌪️") into local storage (`AsyncStorage`) upon first launch using a dedicated `@hiit_initialized` storage flag. 

To clearly identify AI workouts without cluttering timer titles with "AI:" prefixes, we added an optional `isAiGenerated?: boolean` property to the `Timer` model and render a distinct `✨ AI` badge beneath the title in the metadata row on `SelectTimerScreen`.
