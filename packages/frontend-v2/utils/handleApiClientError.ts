import axios, { AxiosError } from "axios";
import { NextRouter } from "next/router";
import { logger } from "./logger";
import { toast } from "./toast";
import {
  emailAlreadyExistsError,
  emailConfirmationMsg,
  emailDoesNotExistError,
  emailHasNotBeenConfirmed,
  weakPasswordError,
  wrongPasswordError,
} from "@graduate/common";

enum ErrorToastId {
  UNAUTHORIZED = "unauthorized",
  SERVER_ERROR = "server error",
  FORBIDDEN = "forbidden",
  BAD_DATA = "bad data",
}

/**
 * Handles the error returned by our API client.
 *
 * - Not authenticated: Redirects to /login
 * - Not authorized: Toast with custom message
 * - Any other server side error: Toast
 * - Client side error: Trigger error boundary by rethrowing
 *
 * @param error  The error returned by our api client
 * @param router Next router to redirect to /login if needed
 */
export const handleApiClientError = (
  error: AxiosError | Error,
  router: NextRouter
) => {
  if (axios.isAxiosError(error)) {
    handleAxiosError(error, router);
  } else {
    logger.debug("handleApiClientError", "Client side error", error);

    // since it is a client side error, simply throw the error so that the error boundary catches it
    throw error;
  }
};

const handleAxiosError = (error: AxiosError, router: NextRouter) => {
  const statusCode = error.response?.status;

  if (statusCode === 400) {
    logger.debug("handleApiClientError", "Bad Request", error);
    let toastMsg = "";
    const errorMsg = error.response?.data.message;

    switch (errorMsg) {
      case emailAlreadyExistsError:
        toastMsg = "The email you submitted already exists.";
        break;
      case emailDoesNotExistError:
        toastMsg = "The email you entered does not exist. Please try again.";
        break;
      case emailHasNotBeenConfirmed:
        toastMsg =
          "The given email has not been confirmed yet. We can't reset your password.";
        break;
      case weakPasswordError:
        toastMsg = "The entered password is too weak";
        break;
      case wrongPasswordError:
        toastMsg = "Incorrect Password!";
        break;
      default:
        toastMsg = `Sorry, we sent some invalid data. Try again and if this persists please report it to us through the bug report button at the top.`;
        break;
    }

    toast.error(toastMsg, { toastId: ErrorToastId.BAD_DATA });
  } else if (statusCode === 401) {
    const errorMsg = error.response?.data.message;
    if (errorMsg === emailConfirmationMsg) {
      router.push("/emailConfirmation");
    } else {
      logger.debug(
        "handleApiClientError",
        "Unauthenticated, redirecting to login",
        error
      );
      router.push("/login");
      toast.warn("Oops, please login first.", {
        toastId: ErrorToastId.UNAUTHORIZED,
      });
    }
  } else if (statusCode === 403) {
    logger.debug("handleApiClientError", "Unauthorized", error);
    toast.error("Sorry, you don't have valid permissions.", {
      toastId: ErrorToastId.FORBIDDEN,
    });
  } else {
    logger.debug(
      "handleApiClientError",
      "Recieved a non 200 status code",
      error
    );

    // TODO: Add some sort of google form/email for a user to report this error
    toast.error(
      "Sorry, something went wrong on our end :( Try again and if this persists please report it to us through the bug report button at the top.",
      {
        toastId: ErrorToastId.SERVER_ERROR,
      }
    );
  }
};
