import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeacherIdentityVerificationCard from "./_component/teacher-identification-card";

const AprovelPage = () => {
  return (
    <Card className="m-8">
      <CardHeader>
        <CardTitle>
          <h1 className="text-3xl font-bold">Action Required</h1>
          <p className="text-xs font-normal pt-1">
            These are the newly registered teachers awaiting approval.
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TeacherIdentityVerificationCard />
      </CardContent>
    </Card>
  );
};

export default AprovelPage;
