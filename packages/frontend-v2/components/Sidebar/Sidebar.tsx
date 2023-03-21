import { Box, Text } from "@chakra-ui/react";
import {
  MajorValidationError,
  MajorValidationResult,
  PlanModel,
  ScheduleCourse2,
} from "@graduate/common";
import { memo, PropsWithChildren, useEffect, useRef, useState } from "react";
import { DraggableScheduleCourse } from "../ScheduleCourse";
import SidebarSection from "./SidebarSection";
import { getAllCoursesFromPlan } from "../../utils/plan/getAllCoursesFromPlan";
import { getSectionError } from "../../utils/plan/getSectionError";
import { handleApiClientError, SIDEBAR_DND_ID_PREFIX } from "../../utils";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useMajor } from "../../hooks/useMajor";
import {
  WorkerMessage,
  WorkerMessageType,
  WorkerPostInfo,
} from "../../validation-worker/worker-messages";
import { useFetchCourses } from "../../hooks/useFetchCourses";
import { getAllCoursesInMajor } from "../../utils/plan/getAllCoursesInMajor";

interface SidebarProps {
  selectedPlan: PlanModel<string>;
}

export enum SidebarValidationStatus {
  Loading = "Loading",
  Error = "Error",
  Complete = "Complete",
}

export const COOP_BLOCK: ScheduleCourse2<string> = {
  name: "Co-op Education",
  classId: "Experiential Learning",
  subject: "",
  numCreditsMax: 8,
  numCreditsMin: 8,
  id: `${SIDEBAR_DND_ID_PREFIX}-co-op-block"`,
};

const createCourseMap = (
  courses: ScheduleCourse2<null>[] | undefined,
  courseErrors: Error | AxiosError | undefined
) => {
  const courseData: { [id: string]: ScheduleCourse2<null> } = {};
  if (courses && !courseErrors) {
    for (const course of courses) {
      if (course) {
        courseData[`${course.subject}${course.classId}`] = course;
      }
    }
  }

  return courseData;
};

// A number to help avoid displaying stale validation info.
let currentRequestNum = 0;

const Sidebar: React.FC<SidebarProps> = memo(({ selectedPlan }) => {
  const router = useRouter();
  const {
    major,
    isLoading: isMajorLoading,
    error,
  } = useMajor(selectedPlan.catalogYear, selectedPlan.major);
  const concentration = major?.concentrations.concentrationOptions.find(
    (concentration) => concentration.title === selectedPlan.concentration
  );

  const workerRef = useRef<Worker>();

  const [validationStatus, setValidationStatus] = useState<
    MajorValidationResult | undefined
  >(undefined);

  const revalidateMajor = () => {
    setValidationStatus(undefined);
    if (!selectedPlan || !major || !workerRef.current) return;

    currentRequestNum += 1;
    const validationInfo: WorkerPostInfo = {
      major: major,
      taken: getAllCoursesFromPlan(selectedPlan),
      concentration: selectedPlan.concentration,
      requestNumber: currentRequestNum,
    };
    workerRef.current?.postMessage(validationInfo);
  };

  // Set up the web worker to handle major validation for us. This helps keep the
  // UI thread free to display our app, preventing UI freezes while our schedule
  // is being validated.
  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../../validation-worker/worker.ts", import.meta.url)
      );
      workerRef.current.onmessage = (message: MessageEvent<WorkerMessage>) => {
        switch (message.data.type) {
          case WorkerMessageType.Loaded:
            revalidateMajor();
            break;
          case WorkerMessageType.ValidationResult:
            // Only update valdation information if it was from the latest request.
            // This helps us avoid displaying outdated information that could be sent
            // due to race conditions.
            if (message.data.requestNumber === currentRequestNum) {
              setValidationStatus(message.data.result);
            }

            break;
          default:
            throw new Error("Invalid worker message!");
        }
      };
    }
    return () => {
      workerRef.current?.terminate();
      workerRef.current = undefined;
    };
    // LINT NOTE: We don't actually want a dependency to the local function
    // revalidateMajor because it will change every time, so we're choosing
    // to omit it here:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever our plan/major changes, we revalidate if the worker
  // is initialized.
  // LINT NOTE: We don't actually want a dependency to the local function
  // revalidateMajor because it will change every time, so we're choosing
  // to omit it here:
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => revalidateMajor(), [selectedPlan, major]);

  const majorCourses = getAllCoursesInMajor(major, concentration);

  const {
    courses,
    isLoading: isCoursesLoading,
    error: courseErrors,
  } = useFetchCourses(majorCourses, selectedPlan.catalogYear);

  const courseData = createCourseMap(courses, courseErrors);

  if (isMajorLoading) {
    return <SidebarContainer title="Loading..." />;
  }

  if (!major) {
    if (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return <SidebarContainer title="Major not found" />;
      }

      handleApiClientError(error, router);
    }

    return <SidebarContainer title="" />;
  }

  const concentrationValidationError: MajorValidationError | undefined =
    getSectionError(major.requirementSections.length, validationStatus);

  let concentrationValidationStatus = SidebarValidationStatus.Complete;
  if (validationStatus === undefined) {
    concentrationValidationStatus = SidebarValidationStatus.Loading;
  } else if (concentrationValidationError) {
    concentrationValidationStatus = SidebarValidationStatus.Error;
  }

  return (
    <SidebarContainer title={major.name} subtitle={selectedPlan.concentration}>
      <Box padding="10px 20px 15px 20px">
        <DraggableScheduleCourse
          scheduleCourse={COOP_BLOCK}
          isDisabled={false}
        />
      </Box>
      {courseData && (
        <>
          {major.requirementSections.map((section, index) => {
            const sectionValidationError: MajorValidationError | undefined =
              getSectionError(index, validationStatus);

            let sectionValidationStatus = SidebarValidationStatus.Complete;
            if (validationStatus === undefined) {
              sectionValidationStatus = SidebarValidationStatus.Loading;
            } else if (sectionValidationError) {
              sectionValidationStatus = SidebarValidationStatus.Error;
            }

            return (
              <SidebarSection
                key={section.title}
                section={section}
                validationStatus={sectionValidationStatus}
                courseData={courseData}
                dndIdPrefix={`${SIDEBAR_DND_ID_PREFIX}-${index}`}
                loading={isCoursesLoading}
              />
            );
          })}
          {concentration && (
            <SidebarSection
              validationStatus={concentrationValidationStatus}
              section={concentration}
              courseData={courseData}
              dndIdPrefix={`${SIDEBAR_DND_ID_PREFIX}-concentration`}
            />
          )}
        </>
      )}
    </SidebarContainer>
  );
});

interface SidebarContainerProps {
  title: string;
  subtitle?: string;
}

export const SidebarContainer: React.FC<
  PropsWithChildren<SidebarContainerProps>
> = ({ title, subtitle, children }) => {
  return (
    <Box p="xs 0px" backgroundColor="neutral.main">
      <Box py="lg" px="sm">
        <Text fontSize="xl" color="primary.red.main" fontWeight={700}>
          {title}
        </Text>
        {subtitle && (
          <Text
            fontSize="md"
            color="primary.blue.dark.main"
            fontWeight="semibold"
          >
            {subtitle}
          </Text>
        )}
      </Box>
      {children}
    </Box>
  );
};

// We need to manually set the display name like this because
// of how we're using memo above.
Sidebar.displayName = "Sidebar";

export { Sidebar };
