import React from "react";
import styled from "styled-components";
import { DNDScheduleCourse } from "../../models/types";
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from "@material-ui/core";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  min-width: 0;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
`;

const Title = styled.div`
  font-weight: normal;
  font-size: 14px;
  margin-right: 4px;
`;

const Subtitle = styled.div`
  margin-right: 10px;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 1;
  min-width: 0;
`;

interface ClassBlockBodyProps {
  course: DNDScheduleCourse;
  hovering: boolean;
  onDelete: () => void;
}

export const ClassBlockBody: React.FC<ClassBlockBodyProps> = ({
  course,
  hovering,
  onDelete,
}) => {
  return (
    <Wrapper>
      <TitleWrapper>
        <Title>{course.subject + course.classId}</Title>
        <Subtitle>{course.name}</Subtitle>
      </TitleWrapper>
      <div
        style={{
          position: "absolute",
          right: 0,
          visibility: hovering ? "visible" : "hidden",
        }}
      >
        <IconButton onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </div>
    </Wrapper>
  );
};
