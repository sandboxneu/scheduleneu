import React, { useState, useEffect } from "react";
import {
  getStudents,
  IAbrStudent,
  StudentsAPI,
} from "../../services/AdvisorService";
import { getAuthToken } from "../../utils/auth-helpers";
import styled from "styled-components";
import { LinearProgress } from "@material-ui/core";
import { Search } from "../../components/common/Search";
import { useHistory } from "react-router";
import { Container } from "./Shared";
import advisingErrorPic from "../../assets/advising-error.png";

const StudentListScrollContainer = styled.div`
  width: auto;
  height: 360px;
  padding: 20px;
  overflow-y: scroll;
  height: 50vh;
`;

const StudentListContainer = styled.div`
  margin-top: 30px;
  border: 1px solid red;
  border-radius: 10px;
  width: auto;
  padding: 20px;
`;

const Loading = styled.div`
  font-size: 15px;
  line-height: 21px;
  margin-top: 20px;
  margin-bottom: 5px;
  margin-left: 30px;
  margin-right: 30px;
`;

const EmptyState = styled.div`
  font-size: 18px;
  line-height: 21px;
  padding: 10px;
`;

const LoadMoreStudents = styled.div`
  font-size: 10px;
  line-height: 21px;
  margin: 10px;
  color: red;
  &:hover {
    text-decoration: underline;
  }
  cursor: pointer;
`;

const NoMoreStudents = styled.div`
  font-size: 10px;
  line-height: 21px;
  margin: 10px;
  color: red;
`;

const StudentContainer = styled.div`
  font-size: 18px;
  line-height: 21px;
  padding: 10px;
  margin-top: 5px;
  &:hover {
    background-color: #efefef;
    border-radius: 20px;
    cursor: pointer;
  }
`;

const StudentEmailNUIDContainer = styled.div`
  font-size: 10px;
  color: gray;
`;

const ErrorContainer = styled.div`
  margin-top: 30px;
  border: 1px solid red;
  border-radius: 10px;
  width: auto;
  padding: 20px;
  background-color: #ececec 
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorTextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const ErrorTitle = styled.div`
  width: 20%
  font-weight: 900;
  font-size: 36px;
  color: #EB5757;
  text-align: left;
`;

const ErrorMessage = styled.div`
  width: 20%
  font-weight: 900;
  font-size: 14px;
  color: #808080;
  text-align: left;
`;

const EMPTY_STUDENT_LIST: IAbrStudent[] = [];

const Student = (props: IAbrStudent) => {
  const { email, fullName, nuId, id } = props;
  const history = useHistory();
  return (
    <StudentContainer
      key={id}
      onClick={() => history.push(`/advisor/manageStudents/${id}`)}
    >
      {fullName}
      <StudentEmailNUIDContainer>
        {email + " | " + nuId}
      </StudentEmailNUIDContainer>
    </StudentContainer>
  );
};

export const StudentsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState(EMPTY_STUDENT_LIST);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isError, setIsError] = useState(true);

  const fetchStudents = (currentStudents: IAbrStudent[], page: number) => {
    setIsLoading(true);
    getStudents(searchQuery, page)
      .then((studentsAPI: StudentsAPI) => {
        setStudents(currentStudents.concat(studentsAPI.students));
        setPageNumber(studentsAPI.nextPage);
        setIsLastPage(studentsAPI.lastPage);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsError(true);
        console.log(isError);
      });
  };

  useEffect(() => {
    setStudents(EMPTY_STUDENT_LIST);
    fetchStudents(EMPTY_STUDENT_LIST, 0);
  }, [searchQuery]);

  return (
    <Container>
      <Search
        placeholder="Search by name, email, or NUID"
        onEnter={query => {
          setSearchQuery(query);
        }}
        isSmall={false}
      />
      {isError ? (
        <ErrorContainer>
          <img src={advisingErrorPic} alt="Error Doggo" />
          <ErrorTextContainer>
            <ErrorTitle>Oh no!</ErrorTitle>
            <ErrorMessage>
              We are unable to retrieve the information you need. Please refresh
              your browser. If the problem persists, contact us here.
            </ErrorMessage>
          </ErrorTextContainer>
        </ErrorContainer>
      ) : (
        <StudentListContainer>
          {isLoading ? (
            <Loading>
              <LinearProgress color="secondary" />
            </Loading>
          ) : null}
          <StudentListScrollContainer>
            {(students === null || students.length == 0) && !isLoading ? (
              <EmptyState> No students found </EmptyState>
            ) : (
              students.map(student => (
                <Student key={student.nuId} {...student} />
              ))
            )}
            {!isLoading ? (
              isLastPage ? (
                <NoMoreStudents>No more students</NoMoreStudents>
              ) : (
                <LoadMoreStudents
                  onClick={() => fetchStudents(students, pageNumber)}
                >
                  Load more students
                </LoadMoreStudents>
              )
            ) : null}
          </StudentListScrollContainer>
        </StudentListContainer>
      )}
    </Container>
  );
};
