import os
import subprocess
import sys

print("🎬 Video to Image Converter")

# Video path
video_path = input("👉 Enter video file path: ").strip()

if not os.path.isfile(video_path):
    print("❌ Video file not found!")
    sys.exit(1)

# Output folder
output_path = input("📁 Enter output folder path: ").strip()
os.makedirs(output_path, exist_ok=True)

# Interval
interval = input("⏱ Every how many seconds?: ").strip()

if not interval.isdigit():
    print("❌ Invalid time interval!")
    sys.exit(1)

interval = int(interval)

print("⚙️ Processing video...")

# ffmpeg command
command = [
    "ffmpeg",
    "-i", video_path,
    "-vf", f"fps=1/{interval}",
    os.path.join(output_path, "image_%04d.png")
]

result = subprocess.run(command)

if result.returncode == 0:
    print("✅ SUCCESS!")
    print(f"🖼 Images saved in: {output_path}")
else:
    print("❌ Something went wrong!")
