import json
import subprocess
import os

def generate_audio(text, filename):
    command = f'echo "{text}" | piper --model tom.onnx --output_file {filename}'
    subprocess.run(command, shell=True, check=True)

def main():
    flashcards = []
    audio_dir = "audio_files"
    
    # Create audio directory if it doesn't exist
    if not os.path.exists(audio_dir):
        os.makedirs(audio_dir)

    for x in range(1, 13):
        question = f"Combien fait 2 plus {x} ?"
        answer = str(2 + x)
        audio_filename = f"{audio_dir}/question_{x}.wav"

        # Generate audio file
        generate_audio(question, audio_filename)

        # Add flashcard data
        flashcards.append({
            "id": x,
            "audioPath": audio_filename,
            "answer": answer,
            "weight": 5,
            "reactionTimes": []
        })

    # Write JSON file
    with open("flashcards.json", "w", encoding="utf-8") as f:
        json.dump(flashcards, f, ensure_ascii=False, indent=2)

    print("Flashcards and audio files generated successfully!")

if __name__ == "__main__":
    main()
