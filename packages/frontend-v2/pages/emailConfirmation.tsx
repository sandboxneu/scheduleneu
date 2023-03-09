import { Flex, Link, Text } from "@chakra-ui/react";
import { API } from "@graduate/api-client";
import { NextPage } from "next";
import router from "next/router";
import { GraduatePreAuthHeader } from "../components";
import { useStudentWithPlans } from "../hooks";
import { toast } from "../utils";

const EmailConfirmation: NextPage = () => {

  const { student } = useStudentWithPlans();
  
  // Email is already confirmed
  if (student) {
    router.push('/home')
  }

  const handleResendConfirmationEmail = async () => {
    try {
      await API.email.resendConfirmationLink();
      toast.success("Successfully resent email!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <GraduatePreAuthHeader />
      <Flex direction="column">
        <Text fontSize="xl" textAlign="center">
          We sent you an email. Click the link in your email to activate your
          account.
        </Text>
        <Link onClick={handleResendConfirmationEmail}>
          Didn't get the email? Click here to resend.
        </Link>
      </Flex>
    </div>
  );
};

export default EmailConfirmation;
