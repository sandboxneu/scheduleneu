import { IconButton, Modal, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useState, useCallback, useMemo } from "react";
import CloseIcon from "@material-ui/icons/Close";
import { Major, Schedule } from "../../../../common/types";
import { RedColorButton } from "../../components/common/ColoredButtons";
import { ExcelWorkbookUpload } from "../../components/ExcelUpload";
import { ICreateTemplatePlan } from "../../models/types";
import { createTemplate } from "../../services/TemplateService";
import { convertToDNDSchedule } from "../../utils";
import styled from "styled-components";
import { getAdvisorUserIdFromState, getMajorsFromState } from "../../state";
import { useSelector } from "react-redux";
import { AppState } from "../../state/reducers/state";
import { findMajorFromName } from "../../utils/plan-helpers";
import { FolderSelection, FolderSelectionContext } from "./FolderSelection";
import { useTemplatesApi } from "./useTemplates";

const InnerSection = styled.section`
  position: fixed;
  background: white;
  width: 50%;
  height: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  outline: none;
  padding-bottom: 24px;
  min-width: 400px;
`;

const FieldContainer = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

interface PlanUploadPopperProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

interface PlanUploadPopperErrorState {
  noFolderSelectedError: string;
}

export const PlanUploadPopper: React.FC<PlanUploadPopperProps> = ({
  visible,
  setVisible,
}) => {
  // TODO: Add the FolderSelection to the popper
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [hasDuplicateFolderName, setHasDuplicateFolderName] = useState(false);
  const [catalogYear, setCatalogYear] = useState<number | null>(null);
  const [major, setMajor] = useState<Major | null>(null);
  const [namedSchedules, setNamedSchedules] = useState<[string, Schedule][]>(
    []
  );
  const [errorState, setErrorState] = useState<PlanUploadPopperErrorState>({
    noFolderSelectedError: "",
  });

  const { userId, majors } = useSelector((state: AppState) => ({
    userId: getAdvisorUserIdFromState(state),
    majors: getMajorsFromState(state),
  }));

  // This must be used instead of fetching from the context in order to avoid
  // any search query being applied to the available folders.
  const { templates: folders, fetchTemplates } = useTemplatesApi("");

  // Errors:
  // - no folder selected
  // - invalid folder selected
  // - failed to convert schedules

  const renderCatalogYearDropdown = useMemo(() => {
    const catalogYears = [
      ...Array.from(
        new Set(majors.map((maj: Major) => maj.yearVersion.toString()))
      ),
    ];

    return (
      <Autocomplete
        disableListWrap
        options={catalogYears}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            label="Catalog Year"
            fullWidth
          />
        )}
        onChange={(e, value) => {
          setCatalogYear(value === "" ? null : Number(value));
          setMajor(null);
        }}
      />
    );
  }, [majors]);

  const renderMajorDropDown = useMemo(() => {
    const options = majors
      .filter(maj => maj.yearVersion === catalogYear)
      .map(maj => maj.name);

    return (
      <Autocomplete
        disableListWrap
        options={options}
        renderInput={params => (
          <TextField {...params} variant="outlined" label="Major" fullWidth />
        )}
        onChange={(e, value) => {
          setMajor(findMajorFromName(value, majors, catalogYear) || null);
        }}
      />
    );
  }, [catalogYear, majors]);

  const namedScheduleToCreateTemplatePlan = useCallback(
    ([name, schedule]: [string, Schedule]): ICreateTemplatePlan => {
      const [dndSchedule, courseCounter] = convertToDNDSchedule(schedule, 0);

      return {
        name,
        schedule: dndSchedule,
        catalog_year: catalogYear,
        major: major ? major.name : major,
        coop_cycle: null,
        concentration: null,
        folder_id: selectedFolderId,
        folder_name:
          folders.find(folder => folder.id === selectedFolderId)?.name || null,
        course_counter: courseCounter,
      };
    },
    [catalogYear, folders, major, selectedFolderId]
  );

  const createTemplatesFromNamedSchedules = useCallback(async () => {
    if (!namedSchedules) {
      return;
      // TODO error handling
    }

    await Promise.all(
      namedSchedules.map(namedSchedule =>
        createTemplate(userId, namedScheduleToCreateTemplatePlan(namedSchedule))
      )
    );

    fetchTemplates([], 0);
  }, [
    fetchTemplates,
    namedScheduleToCreateTemplatePlan,
    namedSchedules,
    userId,
  ]);

  return (
    <FolderSelectionContext.Provider
      value={{
        folders,
        setSelectedFolderId,
        newFolderName,
        setNewFolderName,
      }}
    >
      <Modal
        style={{ outline: "none" }}
        open={visible}
        onClose={() => {}}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <InnerSection>
          <IconButton
            style={{
              padding: "3px",
              position: "absolute",
              top: "12px",
              right: "18px",
            }}
            onClick={() => setVisible(false)}
          >
            <CloseIcon />
          </IconButton>
          <h1 id="simple-modal-title">Upload Plans</h1>
          <FieldContainer>
            <FolderSelection
              setHasDuplicateFolderName={setHasDuplicateFolderName}
            />
            {renderCatalogYearDropdown}
            {renderMajorDropDown}
            <ExcelWorkbookUpload setNamedSchedules={setNamedSchedules} />
          </FieldContainer>
          <RedColorButton onClick={createTemplatesFromNamedSchedules}>
            Import
          </RedColorButton>
        </InnerSection>
      </Modal>
    </FolderSelectionContext.Provider>
  );
};