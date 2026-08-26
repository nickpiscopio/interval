# 26. Viral Sharing Ladder and Social Rewards

We decided to implement a 9-tier viral sharing badge progression, friend invite rewards, and verified outbound share tracking across the app without requiring an external centralized server backend.

1. **9-Tier Viral Sharing Ladder**:
   - *Megaphone Maestro 📣* (1st share)
   - *Squad Recruiter 👯* (SMS / Direct message share)
   - *Chain Letter of Gains ✉️* (Email / Link share)
   - *Hype Machine 🚀* (5 shares)
   - *Sweat Influencer 🤳* (10 shares)
   - *Chief Fitness Officer 💼* (25 shares)
   - *Viral Phenomenon 🌐* (50 shares)
   - *Cult Leader of Cardio 🕯️* (100 shares)
   - *Galactic Ambassador of Gains 🛸* (1,000 shares)
   - *Workout Pen Pal 📬* (Imported and completed a workout shared by a friend)

2. **Verified Share Tracking & Activity Detection**:
   - `recordShare(activityType)` validates completed native OS shares (`Share.sharedAction`), discarding dismissed dialogs (`Share.dismissedAction`).
   - Analyzes OS `activityType` strings to distinguish Messages/SMS from Mail/Link sharing.

3. **Multi-Touchpoint Viral Distribution**:
   - **CompletionScreen**: Share completed workouts and unlocked badges.
   - **AwardsScreen**: Inspect and share badges anytime, plus a prominent *"Invite Friends & Earn Badges"* hero banner.
   - **SelectTimerScreen**: Quick share button on timer cards to share workout deep links directly.
