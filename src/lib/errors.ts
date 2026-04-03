/**
 * Base error class for FretPad-specific errors
 */
export class FretPadError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "FretPadError";
    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when a chord symbol cannot be parsed
 */
export class ChordParseError extends FretPadError {
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
export class ProgressionParseError extends FretPadError {
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
export class AudioPlaybackError extends FretPadError {
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
export class AudioContextError extends FretPadError {
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
 * Error thrown when microphone access fails
 */
export class MicPermissionError extends FretPadError {
  constructor(
    public readonly reason: "denied" | "not-found" | "unavailable",
    message: string,
  ) {
    super(message, `MIC_${reason.toUpperCase().replace("-", "_")}`);
    this.name = "MicPermissionError";
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

  if (error instanceof MicPermissionError) {
    const messages: Record<
      MicPermissionError["reason"],
      { message: string; action: string }
    > = {
      denied: {
        message: "Microphone access was denied",
        action:
          "Allow microphone access in your browser settings and try again",
      },
      "not-found": {
        message: "No microphone found",
        action: "Connect a microphone and try again",
      },
      unavailable: {
        message: "Microphone is not available in this browser",
        action: "Try using a modern browser like Chrome or Safari",
      },
    };
    const info = messages[error.reason];
    return {
      code: error.code,
      message: info.message,
      recoverable: error.reason !== "unavailable",
      action: info.action,
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

  if (error instanceof FretPadError) {
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
