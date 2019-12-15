import { AppState } from "./reducers/state";
import {
  DNDSchedule,
  Major,
  CourseWarning,
  IWarning,
  DNDScheduleTerm,
} from "../models/types";

export const getScheduleFromState = (state: AppState): DNDSchedule =>
  state.schedule.present.schedule;

export const getPlanStrFromState = (state: AppState): string | undefined =>
  state.user.planStr;

export const getMajorFromState = (state: AppState): Major | undefined =>
  state.user.major;

export const getWarningsFromState = (state: AppState): IWarning[] =>
  state.schedule.present.warnings;

export const getCourseWarningsFromState = (
  state: AppState,
  semester: DNDScheduleTerm
): CourseWarning[] =>
  state.schedule.present.courseWarnings.filter(
    w => w.termId === semester.termId
  );
