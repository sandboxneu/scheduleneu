import { DeleteIcon } from "@chakra-ui/icons";
import {
  Flex,
  Grid,
  GridItem,
  GridItemProps,
  IconButton,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import {
  ScheduleCourse2,
  ScheduleYear2,
  SeasonEnum,
  YearError,
} from "@graduate/common";
import { ScheduleTerm } from "./ScheduleTerm";

interface ToggleYearProps {
  isExpanded: boolean;
  toggleExpanded: () => void;
}

interface ScheduleYearProps extends ToggleYearProps {
  scheduleYear: ScheduleYear2<string>;
  yearCoReqError: YearError | undefined;
  yearPreReqError: YearError | undefined;

  /** Function to add classes to a given term in the plan being displayed. */
  addClassesToTermInCurrPlan: (
    classes: ScheduleCourse2<null>[],
    termYear: number,
    termSeason: SeasonEnum
  ) => void;

  /** Function to remove a course from a given term in the plan being displayed. */
  removeCourseFromTermInCurrPlan: (
    course: ScheduleCourse2<unknown>,
    termYear: number,
    termSeason: SeasonEnum
  ) => void;

  /** Function to remove the curr year from the plan */
  removeYearFromCurrPlan: () => void;
}

export const ScheduleYear: React.FC<ScheduleYearProps> = ({
  scheduleYear,
  addClassesToTermInCurrPlan,
  removeCourseFromTermInCurrPlan,
  isExpanded,
  toggleExpanded,
  removeYearFromCurrPlan,
  yearCoReqError,
  yearPreReqError,
}) => {
  // sum all credits over all the courses over each semester
  const totalCreditsThisYear = [
    scheduleYear.fall,
    scheduleYear.spring,
    scheduleYear.summer1,
    scheduleYear.summer2,
  ].reduce((totalCreditsForYear, term) => {
    // sum all credits over all courses
    const totalCreditsThisTerm = term.classes.reduce(
      (totalCreditsForTerm, course) => {
        return totalCreditsForTerm + course.numCreditsMin;
      },
      0
    );

    return totalCreditsForYear + totalCreditsThisTerm;
  }, 0);

  return (
    <Flex flexDirection="column">
      <YearHeader
        year={scheduleYear}
        totalCreditsTaken={totalCreditsThisYear}
        isExpanded={isExpanded}
        toggleExpanded={toggleExpanded}
        removeYearFromCurrPlan={removeYearFromCurrPlan}
      />
      {isExpanded && (
        <Grid templateColumns="repeat(4, 1fr)" minHeight="220px">
          <ScheduleTerm
            termCoReqErr={yearCoReqError?.fall}
            termPreReqErr={yearPreReqError?.fall}
            scheduleTerm={scheduleYear.fall}
            addClassesToTermInCurrPlan={addClassesToTermInCurrPlan}
            removeCourseFromTermInCurrPlan={removeCourseFromTermInCurrPlan}
          />
          <ScheduleTerm
            termCoReqErr={yearCoReqError?.spring}
            termPreReqErr={yearPreReqError?.spring}
            scheduleTerm={scheduleYear.spring}
            addClassesToTermInCurrPlan={addClassesToTermInCurrPlan}
            removeCourseFromTermInCurrPlan={removeCourseFromTermInCurrPlan}
          />
          {/* TODO: support summer full term */}
          <ScheduleTerm
            termCoReqErr={yearCoReqError?.summer1}
            termPreReqErr={yearPreReqError?.summer1}
            scheduleTerm={scheduleYear.summer1}
            addClassesToTermInCurrPlan={addClassesToTermInCurrPlan}
            removeCourseFromTermInCurrPlan={removeCourseFromTermInCurrPlan}
          />
          <ScheduleTerm
            termCoReqErr={yearCoReqError?.summer2}
            termPreReqErr={yearPreReqError?.summer2}
            scheduleTerm={scheduleYear.summer2}
            addClassesToTermInCurrPlan={addClassesToTermInCurrPlan}
            removeCourseFromTermInCurrPlan={removeCourseFromTermInCurrPlan}
            isLastColumn
          />
        </Grid>
      )}
    </Flex>
  );
};

interface YearHeaderProps extends ToggleYearProps {
  year: ScheduleYear2<string>;
  totalCreditsTaken: number;
  removeYearFromCurrPlan: () => void;
}

/** Displays the academic year, credits taken and hide/show button for the year. */
const YearHeader: React.FC<YearHeaderProps> = ({
  year,
  totalCreditsTaken,
  isExpanded,
  toggleExpanded,
  removeYearFromCurrPlan,
}) => {
  const backgroundColor = isExpanded
    ? "primary.blue.dark"
    : "primary.blue.light";

  return (
    <Flex
      alignItems="center"
      backgroundColor={backgroundColor + ".main"}
      _hover={{
        backgroundColor: "primary.blue.light.600",
      }}
      transition="background-color 0.15s ease"
      paddingTop="sm"
      paddingBottom="sm"
      onClick={toggleExpanded}
      cursor="pointer"
      userSelect="none"
    >
      <Flex flexDirection="column" marginLeft="md">
        <Text color="white">Year {year.year}</Text>
        <Text color="white" fontWeight="bold">
          {totalCreditsTaken} credits
        </Text>
      </Flex>
      <Tooltip label={`Delete year ${year.year}?`} fontSize="md">
        <IconButton
          aria-label="Delete course"
          variant="ghost"
          color="white"
          icon={<DeleteIcon />}
          marginLeft="auto"
          marginRight="sm"
          _hover={{ bg: "white", color: "primary.red.main" }}
          _active={{ bg: `${backgroundColor}.900` }}
          onClick={(e) => {
            // important to prevent the click from propogating upwards and triggering the toggle
            e.stopPropagation();
            removeYearFromCurrPlan();
          }}
        />
      </Tooltip>
    </Flex>
  );
};
