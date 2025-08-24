# Python program to translate speech to text and text to speech
# and save recognized text into a file

import speech_recognition as sr
import pyttsx3
import datetime

# Initialize the recognizer
r = sr.Recognizer()

# Initialize text-to-speech engine (only once)
engine = pyttsx3.init()


# Function to convert text to speech
def SpeakText(command):
    engine.say(command)
    engine.runAndWait()


# Create a new file with timestamp (so it doesn’t overwrite old ones)
filename = f"voice_output_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

with open(filename, "w") as f:  # create new file
    f.write("Speech Recognition Log\n")
    f.write("=======================\n\n")

print(f"✅ Speech will be saved in: {filename}\n")

# Loop infinitely for user to speak
while True:
    try:
        # use the microphone as source for input.
        with sr.Microphone() as source2:
            r.adjust_for_ambient_noise(source2, duration=0.2)
            print("Listening... 🎤")

            # listens for the user's input
            audio2 = r.listen(source2)

            # Using Google to recognize audio
            MyText = r.recognize_google(audio2)
            MyText = MyText.lower()

            print(f"Did you say: {MyText}")
            SpeakText(MyText)

            # Save the recognized text into the file
            with open(filename, "a") as f:
                f.write(MyText + "\n")

            # optional: exit if user says "stop" or "quit"
            if "stop" in MyText or "quit" in MyText:
                print("👋 Exiting program...")
                SpeakText("Goodbye!")
                break

    except sr.RequestError as e:
        print("Could not request results; {0}".format(e))

    except sr.UnknownValueError:
        print("Unknown error occurred, could not understand audio")
