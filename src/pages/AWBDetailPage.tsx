// This page is deprecated - redirects to the features version
import { Navigate, useParams } from "react-router-dom";

const AWBDetailPage = () => {
  const { id } = useParams();
  return <Navigate to={`/awbs/${id}`} replace />;
};

export default AWBDetailPage;
