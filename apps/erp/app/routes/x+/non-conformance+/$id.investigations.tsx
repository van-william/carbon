import { requirePermissions } from "@carbon/auth/auth.server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  HStack,
  VStack,
} from "@carbon/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { useRouteData } from "~/hooks";

import type {
  NonConformance,
  NonConformanceInvestigationTask,
} from "~/modules/quality";
import { getNonConformanceInvestigationTasks } from "~/modules/quality";
import {
  TaskItem,
  TaskProgress,
} from "~/modules/quality/ui/NonConformance/NonConformanceTask";
import { path } from "~/utils/path";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "quality",
  });

  const { id } = params;
  if (!id) throw new Error("Non-conformance ID is required");

  const investigationTasks = await getNonConformanceInvestigationTasks(
    client,
    id,
    companyId
  );

  return json({
    investigationTasks: investigationTasks.data || [],
  });
}

export default function NonConformanceTasks() {
  const { investigationTasks } = useLoaderData<typeof loader>();
  const { id } = useParams();
  if (!id) throw new Error("Non-conformance ID is required");
  const routeData = useRouteData<{
    nonConformance: NonConformance;
  }>(path.to.nonConformance(id));

  return (
    <VStack spacing={2} className="w-full">
      <InvestigationTasksList
        tasks={investigationTasks}
        isDisabled={routeData?.nonConformance.status === "Closed"}
      />
    </VStack>
  );
}

function InvestigationTasksList({
  tasks,
  isDisabled,
}: {
  tasks: NonConformanceInvestigationTask[];
  isDisabled: boolean;
}) {
  if (tasks.length === 0) return null;

  return (
    <Card className="w-full min-h-[calc(100vh-115px)]" isCollapsible>
      <HStack className="justify-between w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Investigations
          </CardTitle>
        </CardHeader>
        <TaskProgress tasks={tasks} />
      </HStack>
      <CardContent>
        <VStack spacing={3}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              type="investigation"
              isDisabled={isDisabled}
            />
          ))}
        </VStack>
      </CardContent>
    </Card>
  );
}
