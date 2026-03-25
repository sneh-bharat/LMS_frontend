export function filterdata(
  results: any[],
  searchQuery: string,
  filterStatus: string,
  filterPriority: string,
  filterDepartment: string
) {
  return results.filter(result => {
    const matchesSearch = searchQuery === '' || 
      result.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || result.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || result.priority === filterPriority;
    const matchesDepartment = filterDepartment === 'All' || result.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });
}