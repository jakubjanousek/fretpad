/**
 * Base error class for FretFlow-specific errors
 */
export class FretFlowError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "FretFlowError";
    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when a chord symbol cannot be parsed
 */
export class ChordParseError extends FretFlowError {
  constructor(
    public readonly symbol: string,
    message?: string,
  ) {
    super(message || `Invalid chord symbol: "${symbol}"`, "CHORD_PARSE_ERROR");
    this.name = "ChordParseError";
  }
}

/**
 * Error thrown when a progression cannot be parsed
 */
export class ProgressionParseError extends FretFlowError {
  constructor(
    public readonly input: string,
    message?: string,
  ) {
    super(
      message || `Invalid progression: "${input}"`,
      "PROGRESSION_PARSE_ERROR",
    );
    this.name = "ProgressionParseError";
  }
}

/**
 * Error thrown when audio playback fails
 */
export class AudioPlaybackError extends FretFlowError {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message, "AUDIO_PLAYBACK_ERROR");
    this.name = "AudioPlaybackError";
  }
}

/**
 * Error thrown when audio context cannot be started
 */
export class AudioContextError extends FretFlowError {
  constructor(message?: string) {
    super(
      message ||
        "Failed to start audio context. Please interact with the page first.",
      "AUDIO_CONTEXT_ERROR",
    );
    this.name = "AudioContextError";
  }
}

/**
 * Error information for display in UI
 */
export interface ErrorInfo {
  code: string;
  message: string;
  recoverable: boolean;
  action?: string; // Suggested action for the user
}

/**
 * Converts an error to a user-friendly ErrorInfo object
 */
export function toErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof ChordParseError) {
    return {
      code: error.code,
      message: `"${error.symbol}" is not a valid chord symbol`,
      recoverable: true,
      action: "Try a chord like Cmaj7, Dm7, or G7",
    };
  }

  if (error instanceof ProgressionParseError) {
    return {
      code: error.code,
      message: "Could not parse the progression",
      recoverable: true,
      action: "Check that all chord symbols are valid",
    };
  }

  if (error instanceof AudioContextError) {
    return {
      code: error.code,
      message: error.message,
      recoverable: true,
      action: "Click anywhere on the page and try again",
    };
  }

  if (error instanceof AudioPlaybackError) {
    return {
      code: error.code,
      message: "Audio playback failed",
      recoverable: true,
      action: "Try stopping and starting playback again",
    };
  }

  if (error instanceof FretFlowError) {
    return {
      code: error.code,
      message: error.message,
      recoverable: false,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      recoverable: false,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
    recoverable: false,
  };
}
