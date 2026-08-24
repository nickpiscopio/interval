# 4. Remote Video Streaming for Exercises

We decided to host exercise demonstration videos on a remote CDN and stream them dynamically in the app using `expo-av`. This avoids inflating the application binary size, while maintaining the ability to show video instructions for each exercise.
