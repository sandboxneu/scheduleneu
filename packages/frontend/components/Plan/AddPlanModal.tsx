import { AddIcon } from "@chakra-ui/icons";
import {
  Text,
  Stack,
  Button,
  Checkbox,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { API } from "@graduate/api-client";
import {
  CreatePlanDto,
  CreatePlanDtoWithoutSchedule,
  PlanModel,
} from "@graduate/common";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import {
  useSupportedMajors,
  USE_STUDENT_WITH_PLANS_SWR_KEY,
  useStudentWithPlans,
} from "../../hooks";
import {
  cleanDndIdsFromStudent,
  createEmptySchedule,
  extractSupportedMajorNames,
  extractSupportedMajorYears,
  handleApiClientError,
  noLeadOrTrailWhitespacePattern,
} from "../../utils";
import { BlueButton } from "../Button";
import { PlanInput, PlanSelect } from "../Form";
import { HelperToolTip } from "../Help";
import { PlanConcentrationsSelect } from "./PlanConcentrationsSelect";
import { IsGuestContext } from "../../pages/_app";

interface AddPlanModalProps {
  setSelectedPlanId: Dispatch<SetStateAction<number | undefined | null>>;
}

export const AddPlanModal: React.FC<AddPlanModalProps> = ({
  setSelectedPlanId,
}) => {
  const router = useRouter();
  const { onOpen, onClose: onCloseDisplay, isOpen } = useDisclosure();
  const { supportedMajorsData, error: supportedMajorsError } =
    useSupportedMajors();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
    control,
  } = useForm<CreatePlanDtoWithoutSchedule>({
    mode: "onTouched",
    shouldFocusError: true,
  });
  const [isNoMajorSelected, setIsNoMajorSelected] = useState(false);
  const { isGuest } = useContext(IsGuestContext);
  const { student } = useStudentWithPlans();

  if (!student) {
    return <></>;
  }

  if (supportedMajorsError) {
    handleApiClientError(supportedMajorsError, router);
  }

  const onSubmitHandler = async (payload: CreatePlanDtoWithoutSchedule) => {
    const schedule = createEmptySchedule();
    const newPlan: CreatePlanDto = {
      name: payload.name,
      catalogYear: isNoMajorSelected ? undefined : payload.catalogYear,
      major: isNoMajorSelected ? undefined : payload.major,
      concentration: isNoMajorSelected ? undefined : payload.concentration,
      schedule,
    };

    // create the new plan
    let createdPlanId: number;
    if (isGuest) {
      createdPlanId = student.plans.length + 1;
      // Create plan in local storage
      const planInLocalStorage: PlanModel<null> = {
        ...newPlan,
        id: createdPlanId,
        createdAt: new Date(),
        updatedAt: new Date(),
        student: cleanDndIdsFromStudent(student),
      } as PlanModel<null>;

      window.localStorage.setItem(
        "student",
        JSON.stringify({
          ...student,
          plans: [...student.plans, planInLocalStorage],
        })
      );
    } else {
      try {
        const createdPlan = await API.plans.create(newPlan);
        createdPlanId = createdPlan.id;
      } catch (error) {
        handleApiClientError(error as Error, router);

        // don't proceed further if POST failed
        return;
      }
    }

    // refresh the cache and close the modal
    mutate(USE_STUDENT_WITH_PLANS_SWR_KEY);
    onCloseAddPlanModal();
    setSelectedPlanId(createdPlanId);
  };

  const onCloseAddPlanModal = () => {
    reset();
    setIsNoMajorSelected(false);
    onCloseDisplay();
  };

  const catalogYear = watch("catalogYear");
  const majorName = watch("major");
  const concentration = watch("concentration");

  const noMajorHelperLabel = (
    <Stack>
      <Text>
        You can opt out of selecting a major for this plan if you are unsure or
        if we do not support your major.
      </Text>
      <Text>
        Without a selected major, we won&apos;t be able to display the major
        requirements.
      </Text>
    </Stack>
  );

  return (
    <>
      <BlueButton leftIcon={<AddIcon />} onClick={onOpen} ml="xs" size="md">
        New Plan
      </BlueButton>
      <Modal isOpen={isOpen} onClose={() => onCloseAddPlanModal()} size="md">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmitHandler)}>
            <ModalCloseButton />
            <ModalHeader color="primary.blue.dark.main" textAlign="center">
              New Plan
            </ModalHeader>
            <ModalBody>
              <VStack spacing="sm" alignItems="start">
                <PlanInput
                  label="Title"
                  id="name"
                  type="text"
                  placeholder="My Plan"
                  error={errors.name}
                  {...register("name", {
                    required: "Title is required",
                    pattern: noLeadOrTrailWhitespacePattern,
                  })}
                />
                <Flex alignItems="center">
                  <Checkbox
                    mb="0"
                    mr="xs"
                    borderColor="primary.blue.dark.main"
                    isChecked={isNoMajorSelected}
                    onChange={() => setIsNoMajorSelected(!isNoMajorSelected)}
                  />
                  <Text
                    color="primary.blue.dark.main"
                    size="md"
                    fontWeight="medium"
                    mb="0"
                    mr="2xs"
                  >
                    No Major
                  </Text>
                  <HelperToolTip label={noMajorHelperLabel} />
                </Flex>
                {!isNoMajorSelected && (
                  <>
                    <PlanSelect
                      label="Catalog Year"
                      noValueOptionLabel="Select a Catalog Year"
                      name="catalogYear"
                      control={control}
                      options={extractSupportedMajorYears(supportedMajorsData)}
                      onChangeSideEffect={(val: string | null) => {
                        const newYear = val ? parseInt(val, 10) : null;
                        if (newYear !== catalogYear) {
                          if (
                            val &&
                            majorName &&
                            supportedMajorsData?.supportedMajors?.[val]?.[
                              majorName
                            ]
                          ) {
                            // we can keep the major, but we should check the concentration
                            if (
                              majorName &&
                              !supportedMajorsData?.supportedMajors?.[val]?.[
                                majorName
                              ]?.concentrations?.includes(concentration ?? "")
                            ) {
                              setValue("concentration", "");
                            }
                          } else {
                            setValue("major", "");
                          }
                        }
                      }}
                      rules={{ required: "Catalog year is required." }}
                      isNumeric
                    />
                    <PlanSelect
                      label="Major"
                      noValueOptionLabel="Select a Major"
                      name="major"
                      control={control}
                      options={extractSupportedMajorNames(
                        catalogYear,
                        supportedMajorsData
                      )}
                      onChangeSideEffect={() => {
                        setValue("concentration", "");
                      }}
                      rules={{ required: "Major is required." }}
                      helperText='First select your catalog year. If you still cannot find your major, select "No Major" above.'
                      isSearchable
                    />
                    <PlanConcentrationsSelect
                      catalogYear={catalogYear}
                      majorName={majorName}
                      supportedMajorsData={supportedMajorsData}
                      control={control}
                    />
                  </>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter justifyContent="center">
              <Flex columnGap="sm">
                <Button
                  variant="solidWhite"
                  size="md"
                  borderRadius="lg"
                  onClick={onCloseAddPlanModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  isLoading={isSubmitting}
                  size="md"
                  borderRadius="lg"
                  type="submit"
                >
                  Create Plan
                </Button>
              </Flex>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};