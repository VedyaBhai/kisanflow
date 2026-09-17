// KISANFLOW Telugu voice service

export function playTeluguVoice(text) {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    text ||
      "కిసాన్ ఫ్లోలో మీ పంట అవసరం నమోదు చేయబడింది. దయచేసి అందుబాటులో ఉన్న పరిమాణాన్ని తెలియజేయండి."
  );

  utterance.lang = "te-IN";
  utterance.rate = 0.9;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const teluguVoice = voices.find(
    (voice) =>
      voice.lang &&
      voice.lang.toLowerCase().startsWith("te")
  );

  if (teluguVoice) {
    utterance.voice = teluguVoice;
  }

  window.speechSynthesis.speak(utterance);

  return true;
}
