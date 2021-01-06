import React, { useState } from "react";
import styled from "styled-components";
import { Tabs, Tab, Button, Theme, withStyles } from "@material-ui/core";
import { withRouter, RouteComponentProps, useHistory } from "react-router-dom";
import { ColoredButton } from "../components/common/ColoredButton";
import { removeAuthTokenFromCookies } from "../utils/auth-helpers";
import { useDispatch } from "react-redux";
import { resetUserAction } from "../state/actions/userActions";
import { NORTHEASTERN_RED } from "../constants";

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 20px;
`;

const HomeText = styled.a`
  font-weight: bold;
  font-size: 36px;
  text-decoration: none;
  color: black;
`;

const StyledTab = styled(Tab)`
  color: white !important;
`;

const Container = styled.div`
  background-color: "#ff76ff";
`;
const TabsWrapper = styled.div`
  margin: 20px -30px;
`;

const PATHS = [
  `/advisor/notifications`,
  `/advisor/manageStudents`,
  `/advisor/templates`,
];

const GenericAdvisingTemplate: React.FC = ({ children }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const curPath = history.location.pathname;
  const startTab = PATHS.findIndex(path => curPath.startsWith(path));
  const [currentTab, setCurrentTab] = useState(startTab);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    history.push(PATHS[newValue]);
    setCurrentTab(newValue);
  };

  const logOut = () => {
    dispatch(resetUserAction());
    window.location.reload();
    removeAuthTokenFromCookies();
    history.push("/");
  };

  return (
    <Container>
      <Header>
        <HomeText>GraduateNU</HomeText>
        <ColoredButton onClick={() => logOut()}>Logout</ColoredButton>
      </Header>
      <TabsWrapper>
        <Tabs
          value={currentTab}
          onChange={handleChange}
          style={{ backgroundColor: "#EB5757" }}
          TabIndicatorProps={{
            style: {
              backgroundColor: "transparent",
              bottom: "10px",
              borderRadius: "15px",
              border: "2px solid white",
              height: "25px",
            },
          }}
          centered
        >
          <StyledTab onChange={handleChange} label="Notifications" />
          <StyledTab onChange={handleChange} label="Students" />
          <StyledTab onChange={handleChange} label="Templates" />
        </Tabs>
      </TabsWrapper>
      {children}
    </Container>
  );
};

export const GenericAdvisingTemplateComponent = GenericAdvisingTemplate;
