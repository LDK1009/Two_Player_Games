import {
  createAudioPlayer,
  preload,
  type AudioPlayer,
  type AudioSource,
} from 'expo-audio';

export async function preloadGameAudio(source: AudioSource): Promise<void> {
  await preload(source);
}

export function createGameAudioPlayer(source: AudioSource): AudioPlayer {
  const player = createAudioPlayer(source);
  return player;
}

export function releaseGameAudioPlayer(player: AudioPlayer): void {
  player.remove();
}
