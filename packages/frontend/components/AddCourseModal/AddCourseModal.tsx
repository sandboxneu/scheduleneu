import { AddIcon, InfoIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { NUPathEnum, ScheduleCourse2 } from "@graduate/common";
import { useState } from "react";
import { useSearchCourses } from "../../hooks";
import {
  getCourseDisplayString,
  getRequiredCourseCoreqs,
  isEqualCourses,
} from "../../utils";
import { sortCoursesByNUPath } from "../../utils/course/sortCoursesByNUPath";
import { GraduateToolTip } from "../GraduateTooltip";
import { HelperToolTip } from "../Help";
import { NUPathCheckBox } from "./NUPathCheckBox";
import { SearchCoursesInput } from "./SearchCoursesInput";
import { SearchResult } from "./SearchResult";
import { SelectedCourse } from "./SelectedCourse";

interface AddCourseModalProps {
  isOpen: boolean;
  catalogYear?: number;
  /** Function to close the modal UX, returned from the useDisclosure chakra hook */
  closeModalDisplay: () => void;

  /** Function to check if the given course exists in the plan being displayed. */
  isCourseAlreadyAdded: (course: ScheduleCourse2<unknown>) => boolean;

  /** Function to add classes to the curr term in the plan being displayed. */
  addSelectedClasses: (courses: ScheduleCourse2<null>[]) => void;

  /** Should we autoselect coreqs for courses that are selected. */
  isAutoSelectCoreqs?: boolean;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  catalogYear,
  closeModalDisplay,
  isCourseAlreadyAdded,
  addSelectedClasses,
  isAutoSelectCoreqs,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<
    ScheduleCourse2<null>[]
  >([]);
  const [isLoadingSelectCourse, setIsLoadingSelectCourse] = useState(false);
  const [selectedNUPaths, setSelectedNUPaths] = useState<NUPathEnum[]>([]);

  // TODO search with empty query

  const {
    courses,
    isLoading: isCourseSearchLoading,
    error,
  } = useSearchCourses(searchQuery, catalogYear);

  const addSelectedCourse = async (course: ScheduleCourse2<null>) => {
    // don't allow courses to be selected multiple times
    if (isCourseAlreadySelected(course)) {
      return;
    }
    setIsLoadingSelectCourse(true);

    // grab any coreqs of the course that haven't already been selected/added to the term
    const coreqs = isAutoSelectCoreqs
      ? (await getRequiredCourseCoreqs(course, catalogYear)).filter((coreq) => {
          const isAlreadySelected = selectedCourses.find((selectedCourse) =>
            isEqualCourses(selectedCourse, coreq)
          );
          const isAlreadyAdded = isCourseAlreadyAdded(coreq);
          return !(isAlreadyAdded || isAlreadySelected);
        })
      : [];

    const updatedSelectedCourses = [...selectedCourses, course, ...coreqs];

    setSelectedCourses(updatedSelectedCourses);
    setIsLoadingSelectCourse(false);
  };

  const removeSelectedCourse = (course: ScheduleCourse2<null>) => {
    const updatedSelectedCourses = selectedCourses.filter(
      (selectedCourse) => !isEqualCourses(selectedCourse, course)
    );

    setSelectedCourses(updatedSelectedCourses);
  };

  const isCourseAlreadySelected = (course: ScheduleCourse2<null>) => {
    return selectedCourses.some((selectedCourse) =>
      isEqualCourses(selectedCourse, course)
    );
  };

  const addClassesOnClick = async () => {
    if (selectedCourses.length === 0) {
      return;
    }
    addSelectedClasses(selectedCourses);
    onClose();
  };

  // filters the given list of courses by nuPaths within the
  const filterClassesByPaths = (
    courses: ScheduleCourse2<null>[]
  ): ScheduleCourse2<null>[] => {
    if (selectedNUPaths.length == 0) {
      return courses;
    }
    const filteredCourses = courses.filter((course) => hasFilteredPath(course));

    return filteredCourses;
  };

  const hasFilteredPath = (course: ScheduleCourse2<null>): boolean => {
    let isInFilter = false;
    selectedNUPaths.forEach((curPath) => {
      if (course.nupaths != null && course.nupaths.includes(curPath)) {
        isInFilter = true;
      }
    });
    return isInFilter;
  };

  const onClose = () => {
    setSelectedCourses([]);
    setSearchQuery("");
    closeModalDisplay();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          color="primary.blue.dark.main"
          borderBottom="2px"
          borderColor="neutral.100"
        >
          <Flex alignItems="center" justifyContent="center" columnGap="2xs">
            <Text>Add Courses</Text>
            <HelperToolTip label="We try our best to search for courses across as many semesters as possible. If you cannot find your course, please report a bug with your plan catalog year and we will try to solve it as soon as possible." />
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody padding="0">
          <Grid templateColumns="1fr 2fr">
            {/* NUPath sidebar */}
            <Flex
              direction="column"
              bg="neutral.50"
              paddingLeft="7"
              paddingY="9"
              borderRight="2px"
              borderColor="neutral.100"
            >
              <Text fontSize="lg" as="b" marginBottom="5">
                NUPath
              </Text>
              <Flex direction="column" gap="2">
                {Object.keys(NUPathEnum).map((nuPath) => (
                  <NUPathCheckBox
                    key={nuPath}
                    nuPath={nuPath as keyof typeof NUPathEnum}
                    selectedNUPaths={selectedNUPaths}
                    setSelectedNUPaths={setSelectedNUPaths}
                  />
                ))}
              </Flex>
            </Flex>
            {/* Course Work Area */}
            <Flex direction="column">
              <Flex
                direction="column"
                padding="4"
                borderBottom="2px"
                borderColor="neutral.100"
              >
                <SearchCoursesInput
                  setSearchQuery={setSearchQuery}
                  isCourseSearchLoading={isCourseSearchLoading}
                />
                <Flex
                  direction="column"
                  height="300px"
                  overflow="scroll"
                  marginTop="4"
                >
                  {/* No course search */}
                  {!error && (!courses || courses.length === 0) && (
                    <Flex alignItems="center" justifyContent="center">
                      <InfoIcon color="neutral.300" marginRight="2" />
                      <Text fontSize="sm" color="neutral.300">
                        Search results will show up here.
                      </Text>
                    </Flex>
                  )}
                  {/* On error */}
                  {error && (
                    <GraduateToolTip label="We rely on SearchNEU to search for courses, and there may be an ongoing issue on their end. We recommend refreshing the page and trying again soon. If the issue persists, help us by clicking the Bug/Feature button to report the bug">
                      <Flex
                        alignItems="center"
                        columnGap="xs"
                        justifyContent="center"
                      >
                        <InfoIcon color="primary.red.main" />
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          textAlign="center"
                          color="primary.red.main"
                        >
                          Oops, sorry we couldn&apos;t search for courses... try
                          again in a little bit!
                        </Text>
                      </Flex>
                    </GraduateToolTip>
                  )}
                  {/* Show courses */}
                  {courses &&
                    sortCoursesByNUPath(
                      filterClassesByPaths(courses),
                      selectedNUPaths
                    ).map((course) => (
                      <SearchResult
                        key={getCourseDisplayString(course)}
                        course={course}
                        addSelectedCourse={addSelectedCourse}
                        isResultAlreadyAdded={isCourseAlreadyAdded(course)}
                        isResultAlreadySelected={isCourseAlreadySelected(
                          course
                        )}
                        isSelectingAnotherCourse={isLoadingSelectCourse}
                        selectedNUPaths={selectedNUPaths}
                      />
                    ))}
                </Flex>
              </Flex>

              {/* Selected Courses Area */}
              <Flex padding="4" direction="column">
                <Text fontSize="md" fontWeight="bold">
                  Courses to Add:
                </Text>
                <VStack
                  paddingY="2"
                  height="130px"
                  overflow="scroll"
                  alignItems="stretch"
                >
                  {selectedCourses.map((selectedCourse) => (
                    <SelectedCourse
                      key={getCourseDisplayString(selectedCourse)}
                      selectedCourse={selectedCourse}
                      removeSelectedCourse={removeSelectedCourse}
                      selectedNUPaths={selectedNUPaths}
                    />
                  ))}
                </VStack>
              </Flex>
              <ModalFooter justifyContent="end" gap="md">
                <Button
                  variant="whiteCancelOutline"
                  size="md"
                  borderRadius="lg"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  leftIcon={<AddIcon />}
                  variant="solid"
                  borderRadius="lg"
                  size="md"
                  backgroundColor="primary.blue.light.main"
                  borderColor="primary.blue.light.main"
                  colorScheme="primary.blue.light.main"
                  onClick={addClassesOnClick}
                  isDisabled={selectedCourses.length === 0}
                >
                  Add Courses
                </Button>
              </ModalFooter>
            </Flex>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
