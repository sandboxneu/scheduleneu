import { GetStudentResponse } from "@graduate/common";

export const DELETE_COURSE_AREA_DND_ID = "delete-course-area";
export const SIDEBAR_DND_ID_PREFIX = "sidebar";
export const WEAK_PASSWORD_MSG =
  "A password should be at least 8 characters with digits and letters";
export const SEARCH_NEU_FETCH_COURSE_ERROR_MSG =
  "Sorry, we can't load details for this course right now 😞. We rely on SearchNEU for our course details, and there may be an ongoing issue on their end. We recommend refreshing the page and trying again soon.";

export const defaultGuestStudent: GetStudentResponse = {
  uuid: undefined,
  nuid: undefined,
  fullName: undefined,
  isOnboarded: false,
  email: "guest@guest.com",
  isEmailConfirmed: false,
  academicYear: undefined,
  graduateYear: undefined,
  catalogYear: undefined,
  major: undefined,
  coopCycle: undefined,
  coursesCompleted: undefined,
  coursesTransfered: undefined,
  primaryPlanId: undefined,
  concentration: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  plans: [],
};
