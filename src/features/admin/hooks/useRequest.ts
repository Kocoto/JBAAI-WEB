import { useState, useEffect, useContext } from "react";
import RequestService from "../services/requestService";
import { GetRequestResponse } from "../types/request.types";

const useRequest = () => {
  const [upgradeRequests, setUpgradeRequests] = useState<GetRequestResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await RequestService.getRequestsPending();
        setUpgradeRequests(response);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return { upgradeRequests, isLoading };
};

export default useRequest;
