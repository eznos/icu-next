export type DashboardApiResponse = {
  summary: {
    totalPersonnel: number;
    activePatients: number;
    availableBeds: number;
    pendingAdmissions: number;
  };
  beds: Array<{
    id: string;
    status: 'Available' | 'Occupied';
    patientName: string;
    hn: string;
  }>;
  monthlyAdmissions: number[];
};

export async function fetchDashboardData(): Promise<DashboardApiResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
  const response = await fetch(`${apiBase}/api/dashboard`, {
    headers: {
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Unable to fetch dashboard data');
  }

  return response.json() as Promise<DashboardApiResponse>;
}
