import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  User, 
  SimCard,
  ApiResponse,
  PaginatedResponse,
  StatsResponse,
  Organisation,
  OrganisationFormData
} from '../types';

class ApiService {
  getLeaseSuggestions(query: string) {
    throw new Error("Method not implemented.");
  }
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5009/api";
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // Increased to 30 seconds for remote database
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only redirect to login if:
        // 1. It's a 401 error
        // 2. It's NOT from the login endpoint (to allow login errors to be displayed)
        // 3. User is already authenticated (has a token)
        const isLoginRequest = error.config?.url?.includes("/auth/login");
        const hasToken = localStorage.getItem("token");

        if (error.response?.status === 401 && !isLoginRequest && hasToken) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to get image URL
  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return "";
    
    // If it's already a full URL (S3 or external), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // For local paths, prepend the server URL
    const serverBaseURL = this.baseURL.replace("/api", "");
    // Ensure no double slashes
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${serverBaseURL}${cleanPath}`;
  }

  // Auth endpoints
  async login(email: string, password: string, organisationId: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/login",
      {
        email,
        password,
        organisationId,
      }
    );
    return response.data;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    nationalId: string;
    role?: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/register",
      userData
    );
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.get("/auth/me");
    return response.data;
  }

  // Forgot Password endpoints
  async forgotPassword(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> =
      await this.api.post("/forgot-password", {
        email,
      });
    return response.data;
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> =
      await this.api.post("/reset-password", {
        token,
        newPassword,
      });
    return response.data;
  }

  async verifyResetToken(
    token: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> =
      await this.api.get(`/verify-reset-token/${token}`);
    return response.data;
  }

  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.put("/auth/profile", profileData);
    return response.data;
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.put(
      "/auth/change-password",
      passwordData
    );
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post(
      "/auth/logout"
    );
    return response.data;
  }

  // User endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    nationalId?: string;
    search?: string;
  }): Promise<ApiResponse<{ users: User[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ users: User[]; pagination: any }>
    > = await this.api.get("/users", { params });
    return response.data;
  }

  async getUser(id: string): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    nationalId: string;
    role: string;
    phone?: string;
    organisationId?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.post("/users", userData);
    return response.data;
  }

  async updateUser(
    id: string,
    userData: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/users/${id}`
    );
    return response.data;
  }

  async getUserStats(): Promise<StatsResponse> {
    const response: AxiosResponse<StatsResponse> = await this.api.get(
      "/users/stats/overview"
    );
    return response.data;
  }

  // Property endpoints
  async getProperties(params?: {
    page?: number;
    limit?: number;
    status?: string;
    propertyType?: string;
    city?: string;
    search?: string;
    landlord?: string;
  }): Promise<ApiResponse<{ properties: Property[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ properties: Property[]; pagination: any }>
    > = await this.api.get("/properties", { params });
    return response.data;
  }

  async getProperty(id: string): Promise<ApiResponse<{ property: Property }>> {
    const response: AxiosResponse<ApiResponse<{ property: Property }>> =
      await this.api.get(`/properties/${id}`);
    return response.data;
  }

  async createProperty(
    propertyData: any
  ): Promise<ApiResponse<{ property: Property }>> {
    const response: AxiosResponse<ApiResponse<{ property: Property }>> =
      await this.api.post("/properties", propertyData);
    return response.data;
  }

  async updateProperty(
    id: string,
    propertyData: Partial<Property>
  ): Promise<ApiResponse<{ property: Property }>> {
    const response: AxiosResponse<ApiResponse<{ property: Property }>> =
      await this.api.put(`/properties/${id}`, propertyData);
    return response.data;
  }

  async deleteProperty(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/properties/${id}`
    );
    return response.data;
  }

  async getPropertyStats(): Promise<StatsResponse> {
    const response: AxiosResponse<StatsResponse> = await this.api.get(
      "/properties/stats/overview"
    );
    return response.data;
  }

  async bulkDeleteProperties(ids: string[]): Promise<
    AxiosResponse<
      ApiResponse<{
        deletedCount: number;
        skipped?: { id: string; reason: string }[];
      }>
    >
  > {
    // Using POST to avoid proxies that strip DELETE bodies.
    return this.api.post("/properties/bulk-delete", { ids });
    // If you prefer DELETE with body instead, use:
    // return this.api.delete('/properties', { data: { ids } });
  }

  // Landlord endpoints
  async getLandlords(params?: {
    page?: number;
    limit?: number;
    status?: string;
    businessType?: string;
    search?: string;
  }): Promise<ApiResponse<{ landlords: Landlord[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ landlords: Landlord[]; pagination: any }>
    > = await this.api.get("/landlords", { params });
    return response.data;
  }

  async getLandlord(id: string): Promise<ApiResponse<{ landlord: Landlord }>> {
    const response: AxiosResponse<ApiResponse<{ landlord: Landlord }>> =
      await this.api.get(`/landlords/${id}`);
    return response.data;
  }

  async getCurrentLandlordProfile(): Promise<ApiResponse<{ landlord: Landlord }>> {
    const response: AxiosResponse<ApiResponse<{ landlord: Landlord }>> =
      await this.api.get('/landlord/profile');
    return response.data;
  }

  async createLandlord(
    landlordData: any
  ): Promise<ApiResponse<{ landlord: Landlord }>> {
    const config = {
      headers: {
        "Content-Type":
          landlordData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    };
    const response: AxiosResponse<ApiResponse<{ landlord: Landlord }>> =
      await this.api.post("/landlords", landlordData, config);
    return response.data;
  }

  async updateLandlord(
    id: string,
    landlordData: Partial<Landlord> | FormData
  ): Promise<ApiResponse<{ landlord: Landlord }>> {
    const config = {
      headers: {
        "Content-Type":
          landlordData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    };
    const response: AxiosResponse<ApiResponse<{ landlord: Landlord }>> =
      await this.api.put(`/landlords/${id}`, landlordData, config);
    return response.data;
  }

  async deleteLandlord(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/landlords/${id}`
    );
    return response.data;
  }

  async getLandlordStats(): Promise<StatsResponse> {
    const response: AxiosResponse<StatsResponse> = await this.api.get(
      "/landlords/stats/overview"
    );
    return response.data;
  }

  async bulkDeleteLandlords(
    ids: string[]
  ): Promise<AxiosResponse<ApiResponse<{ deletedCount: number }>>> {
    return this.api.post("/landlords/bulk-delete", { ids });
  }

  async uploadLandlordDocument(
    landlordId: string,
    formData: FormData
  ): Promise<ApiResponse<{ document: any }>> {
    const response: AxiosResponse<ApiResponse<{ document: any }>> =
      await this.api.post(`/landlords/${landlordId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    return response.data;
  }

  async downloadLandlordDocument(
    landlordId: string,
    documentId: string
  ): Promise<any> {
    const response = await this.api.get(
      `/landlords/${landlordId}/documents/${documentId}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async deleteLandlordDocument(
    landlordId: string,
    documentId: string
  ): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> =
      await this.api.delete(`/landlords/${landlordId}/documents/${documentId}`);
    return response.data;
  }

  // Tenant endpoints
  async getTenants(params?: {
    page?: number;
    limit?: number;
    status?: string;
    riskLevel?: string;
    search?: string;
  }): Promise<ApiResponse<{ tenants: Tenant[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ tenants: Tenant[]; pagination: any }>
    > = await this.api.get("/tenants", { params });
    return response.data;
  }

  async getTenant(id: string): Promise<ApiResponse<{ tenant: Tenant }>> {
    const response: AxiosResponse<ApiResponse<{ tenant: Tenant }>> =
      await this.api.get(`/tenants/${id}`);
    return response.data;
  }

  async uploadTenantDocument(
    tenantId: string,
    formData: FormData
  ): Promise<ApiResponse<{ document: any }>> {
    const response: AxiosResponse<ApiResponse<{ document: any }>> =
      await this.api.post(`/tenants/${tenantId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    return response.data;
  }

  async downloadTenantDocument(
    tenantId: string,
    documentId: string
  ): Promise<any> {
    const response = await this.api.get(
      `/tenants/${tenantId}/documents/${documentId}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async deleteTenantDocument(
    tenantId: string,
    documentId: string
  ): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> =
      await this.api.delete(`/tenants/${tenantId}/documents/${documentId}`);
    return response.data;
  }

  async getTenantProperties(id: string): Promise<ApiResponse<{ properties: Property[] }>> {
    const response: AxiosResponse<ApiResponse<{ properties: Property[] }>> =
      await this.api.get(`/tenants/${id}/properties`);
    return response.data;
  }

  async createTenant(
    tenantData: any
  ): Promise<ApiResponse<{ tenant: Tenant }>> {
    const config = {
      headers: {
        "Content-Type":
          tenantData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    };
    const response: AxiosResponse<ApiResponse<{ tenant: Tenant }>> =
      await this.api.post("/tenants", tenantData, config);
    return response.data;
  }

  async updateTenant(
    id: string,
    tenantData: Partial<Tenant>
  ): Promise<ApiResponse<{ tenant: Tenant }>> {
    const response: AxiosResponse<ApiResponse<{ tenant: Tenant }>> =
      await this.api.put(`/tenants/${id}`, tenantData);
    return response.data;
  }

  async deleteTenant(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/tenants/${id}`
    );
    return response.data;
  }

  async getTenantStats(): Promise<StatsResponse> {
    const response: AxiosResponse<StatsResponse> = await this.api.get(
      "/tenants/stats/overview"
    );
    return response.data;
  }

  async bulkDeleteTenants(
    ids: string[]
  ): Promise<AxiosResponse<ApiResponse<{ deletedCount: number }>>> {
    return this.api.post("/tenants/bulk-delete", { ids });
  }

  // Broker endpoints
  async getBrokers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{ brokers: Broker[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ brokers: Broker[]; pagination: any }>
    > = await this.api.get("/brokers", { params });
    return response.data;
  }

  async getBroker(id: string): Promise<ApiResponse<{ broker: Broker }>> {
    const response: AxiosResponse<ApiResponse<{ broker: Broker }>> =
      await this.api.get(`/brokers/${id}`);
    return response.data;
  }

  async uploadBrokerDocument(
    brokerId: string,
    formData: FormData
  ): Promise<ApiResponse<{ document: any }>> {
    const response: AxiosResponse<ApiResponse<{ document: any }>> =
      await this.api.post(`/brokers/${brokerId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    return response.data;
  }

  async downloadBrokerDocument(
    brokerId: string,
    documentId: string
  ): Promise<any> {
    const response = await this.api.get(
      `/brokers/${brokerId}/documents/${documentId}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async deleteBrokerDocument(
    brokerId: string,
    documentId: string
  ): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> =
      await this.api.delete(`/brokers/${brokerId}/documents/${documentId}`);
    return response.data;
  }

  async getBrokerProperties(id: string): Promise<ApiResponse<{ properties: Property[] }>> {
    const response: AxiosResponse<ApiResponse<{ properties: Property[] }>> =
      await this.api.get(`/brokers/${id}/properties`);
    return response.data;
  }

  async createBroker(
    brokerData: any
  ): Promise<ApiResponse<{ broker: Broker }>> {
    const config = {
      headers: {
        "Content-Type":
          brokerData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    };
    const response: AxiosResponse<ApiResponse<{ broker: Broker }>> =
      await this.api.post("/brokers", brokerData, config);
    return response.data;
  }

  async updateBroker(
    id: string,
    brokerData: Partial<Broker>
  ): Promise<ApiResponse<{ broker: Broker }>> {
    const response: AxiosResponse<ApiResponse<{ broker: Broker }>> =
      await this.api.put(`/brokers/${id}`, brokerData);
    return response.data;
  }

  async deleteBroker(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/brokers/${id}`
    );
    return response.data;
  }

  async getBrokerStats(): Promise<StatsResponse> {
    const response: AxiosResponse<StatsResponse> = await this.api.get(
      "/brokers/stats/overview"
    );
    return response.data;
  }

  async bulkDeleteBrokers(
    ids: string[]
  ): Promise<AxiosResponse<ApiResponse<{ deletedCount: number }>>> {
    return this.api.post("/brokers/bulk-delete", { ids });
  }

  // Guarantor endpoints
  async getGuarantors(params?: {
    page?: number;
    limit?: number;
    status?: string;
    riskLevel?: string;
    search?: string;
  }): Promise<ApiResponse<{ guarantors: TenantGuarantor[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ guarantors: TenantGuarantor[]; pagination: any }>
    > = await this.api.get("/guarantors", { params });
    return response.data;
  }

  async getGuarantor(
    id: string
  ): Promise<ApiResponse<{ guarantor: TenantGuarantor }>> {
    const response: AxiosResponse<ApiResponse<{ guarantor: TenantGuarantor }>> =
      await this.api.get(`/guarantors/${id}`);
    return response.data;
  }

  async uploadGuarantorDocument(
    guarantorId: string,
    formData: FormData
  ): Promise<ApiResponse<{ document: any }>> {
    const response: AxiosResponse<ApiResponse<{ document: any }>> =
      await this.api.post(`/guarantors/${guarantorId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    return response.data;
  }

  async downloadGuarantorDocument(
    guarantorId: string,
    documentId: string
  ): Promise<any> {
    const response = await this.api.get(
      `/guarantors/${guarantorId}/documents/${documentId}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async deleteGuarantorDocument(
    guarantorId: string,
    documentId: string
  ): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> =
      await this.api.delete(`/guarantors/${guarantorId}/documents/${documentId}`);
    return response.data;
  }

  async getGuarantorProperties(id: string): Promise<ApiResponse<{ properties: Property[] }>> {
    const response: AxiosResponse<ApiResponse<{ properties: Property[] }>> =
      await this.api.get(`/guarantors/${id}/properties`);
    return response.data;
  }

  async createGuarantor(
    guarantorData: any
  ): Promise<ApiResponse<{ guarantor: TenantGuarantor }>> {
    const config = {
      headers: {
        "Content-Type":
          guarantorData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    };
    const response: AxiosResponse<ApiResponse<{ guarantor: TenantGuarantor }>> =
      await this.api.post("/guarantors", guarantorData, config);
    return response.data;
  }

  async updateGuarantor(
    id: string,
    guarantorData: Partial<TenantGuarantor> | FormData
  ): Promise<ApiResponse<{ guarantor: TenantGuarantor }>> {
    const config = {
      headers: {
        "Content-Type":
          guarantorData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    };
    const response: AxiosResponse<ApiResponse<{ guarantor: TenantGuarantor }>> =
      await this.api.put(`/guarantors/${id}`, guarantorData, config);
    return response.data;
  }

  async deleteGuarantor(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/guarantors/${id}`
    );
    return response.data;
  }

  async getGuarantorStats(): Promise<StatsResponse> {
    const response: AxiosResponse<StatsResponse> = await this.api.get(
      "/guarantors/stats/overview"
    );
    return response.data;
  }

  async bulkDeleteGuarantors(
    ids: string[]
  ): Promise<AxiosResponse<ApiResponse<{ deletedCount: number }>>> {
    return this.api.post("/guarantors/bulk-delete", { ids });
  }

  // Lease endpoints
  async getLeases(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{ leases: Lease[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ leases: Lease[]; pagination: any }>
    > = await this.api.get("/leases", { params });
    return response.data;
  }

  async getLease(id: string): Promise<ApiResponse<{ lease: Lease }>> {
    const response: AxiosResponse<ApiResponse<{ lease: Lease }>> =
      await this.api.get(`/leases/${id}`);
    return response.data;
  }

  async createLease(leaseData: any): Promise<ApiResponse<{ lease: Lease }>> {
    const response: AxiosResponse<ApiResponse<{ lease: Lease }>> =
      await this.api.post("/leases", leaseData);
    return response.data;
  }

  async updateLease(
    id: string,
    leaseData: Partial<Lease>
  ): Promise<ApiResponse<{ lease: Lease }>> {
    const response: AxiosResponse<ApiResponse<{ lease: Lease }>> =
      await this.api.put(`/leases/${id}`, leaseData);
    return response.data;
  }

  async signLease(
    id: string,
    signatureData: {
      signatureType: "tenant" | "landlord" | "witness" | "guarantor" | "broker";
      signatureUrl?: string;
      witnessName?: string;
      signerName?: string;
    }
  ): Promise<ApiResponse<{ lease: Lease }>> {
    const response: AxiosResponse<ApiResponse<{ lease: Lease }>> =
      await this.api.post(`/leases/${id}/sign`, signatureData);
    return response.data;
  }

  async terminateLease(
    id: string,
    terminationData: {
      terminationReason: string;
      terminationDate: string;
    }
  ): Promise<ApiResponse<{ lease: Lease }>> {
    const response: AxiosResponse<ApiResponse<{ lease: Lease }>> =
      await this.api.post(`/leases/${id}/terminate`, terminationData);
    return response.data;
  }

  async generateLeaseDocument(
    id: string
  ): Promise<ApiResponse<{ documentUrl: string }>> {
    const response: AxiosResponse<ApiResponse<{ documentUrl: string }>> =
      await this.api.post(`/leases/${id}/generate-document`);
    return response.data;
  }

  async downloadLeaseDocument(id: string): Promise<Blob> {
    const response = await this.api.get(`/leases/${id}/download-document`, {
      responseType: "blob",
    });
    return response.data;
  }

  async distributeLeaseDocument(
    id: string
  ): Promise<ApiResponse<{ documentUrl: string }>> {
    const response: AxiosResponse<ApiResponse<{ documentUrl: string }>> =
      await this.api.post(`/leases/${id}/distribute-document`);
    return response.data;
  }

  async deleteLease(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/leases/${id}`
    );
    return response.data;
  }

  async getLeaseStats(): Promise<StatsResponse> {
    const response: AxiosResponse<StatsResponse> = await this.api.get(
      "/leases/stats/overview"
    );
    return response.data;
  }

  // SIM Card endpoints
  async getSimCards(params?: {
    page?: number;
    limit?: number;
    status?: string;
    telecomProvider?: string;
    planType?: string;
    search?: string;
  }): Promise<ApiResponse<{ simCards: SimCard[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ simCards: SimCard[]; pagination: any }>
    > = await this.api.get("/sims", { params });
    return response.data;
  }

  async getSimCard(id: string): Promise<ApiResponse<{ simCard: SimCard }>> {
    const response: AxiosResponse<ApiResponse<{ simCard: SimCard }>> =
      await this.api.get(`/sims/${id}`);
    return response.data;
  }

  async createSimCard(
    simData: any
  ): Promise<ApiResponse<{ simCard: SimCard }>> {
    const response: AxiosResponse<ApiResponse<{ simCard: SimCard }>> =
      await this.api.post("/sims", simData);
    return response.data;
  }

  async updateSimCard(
    id: string,
    simData: Partial<SimCard>
  ): Promise<ApiResponse<{ simCard: SimCard }>> {
    const response: AxiosResponse<ApiResponse<{ simCard: SimCard }>> =
      await this.api.put(`/sims/${id}`, simData);
    return response.data;
  }

  async deleteSimCard(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/sims/${id}`
    );
    return response.data;
  }

  async uploadSimCardDocument(
    simCardId: string,
    formData: FormData
  ): Promise<ApiResponse<{ document: any }>> {
    const response: AxiosResponse<ApiResponse<{ document: any }>> =
      await this.api.post(`/sims/${simCardId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    return response.data;
  }

  async downloadSimCardDocument(
    simCardId: string,
    documentId: string
  ): Promise<any> {
    const response = await this.api.get(
      `/sims/${simCardId}/documents/${documentId}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async deleteSimCardDocument(
    simCardId: string,
    documentId: string
  ): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> =
      await this.api.delete(`/sims/${simCardId}/documents/${documentId}`);
    return response.data;
  }

  async bulkDeleteSimCards(
  ids: string[]
): Promise<AxiosResponse<ApiResponse<{ deletedCount: number }>>> {
  
  return this.api.post('/sims/bulk-delete', { ids });
}

  async bulkImportSimCards(bulkData: {
    simCards: any[];
    telecomProvider: any;
  }): Promise<ApiResponse<{ successful: any[]; failed: any[] }>> {
    const response: AxiosResponse<
      ApiResponse<{ successful: any[]; failed: any[] }>
    > = await this.api.post("/sims/bulk-import", bulkData);
    return response.data;
  }

  async getSimCardStats(): Promise<StatsResponse> {
    const response: AxiosResponse<StatsResponse> = await this.api.get(
      "/sims/stats/overview"
    );
    return response.data;
  }

  async getExpiringSimCards(
    days?: number
  ): Promise<
    ApiResponse<{ expiringSims: SimCard[]; count: number; days: number }>
  > {
    const response: AxiosResponse<
      ApiResponse<{ expiringSims: SimCard[]; count: number; days: number }>
    > = await this.api.get("/sims/expiring", {
      params: { days },
    });
    return response.data;
  }

  

  // Generic POST method for custom endpoints
  async post<T = any>(endpoint: string, data?: any): Promise<{ data: T }> {
    const response = await this.api.post(endpoint, data);
    return response;
  }

  // Generic GET method for custom endpoints
  async get<T = any>(endpoint: string): Promise<{ data: T }> {
    const response = await this.api.get(endpoint);
    return response;
  }

  // Email verification methods
  async resendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> =
      await this.api.post("/email-verification/resend");
    return response.data;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<
    ApiResponse<{
      counts: {
        properties: number;
        landlords: number;
        tenants: number;
        brokers: number;
        guarantors: number;
        leases: number;
        simCards: number;
      };
      charts: {
        propertyTypes: Array<{ _id: string; count: number }>;
        propertyStatuses: Array<{ _id: string; count: number }>;
        leaseStatuses: Array<{ _id: string; count: number }>;
      };
      recentActivity: {
        properties: any[];
        leases: any[];
        tenants: any[];
      };
    }>
  > {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      "/dashboard/stats"
    );
    return response.data;
  }

  // Landlord Dashboard methods
  async getLandlordDashboardStats(): Promise<
    ApiResponse<{
      totalProperties: number;
      totalTenants: number;
      activeTenants: number;
      totalGuests: number;
      checkedInGuests: number;
      upcomingCheckouts: number;
    }>
  > {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      "/landlord/dashboard"
    );
    return response.data;
  }

  // Landlord Properties methods
  async getLandlordProperties(params?: {
    page?: number;
    limit?: number;
    status?: string;
    propertyType?: string;
    search?: string;
  }): Promise<ApiResponse<{ properties: Property[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ properties: Property[]; pagination: any }>
    > = await this.api.get("/landlord/properties", { params });
    return response.data;
  }

  async createLandlordProperty(propertyData: {
    propertyName: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    propertyType: string;
    rooms?: number;
    description?: string;
  }): Promise<ApiResponse<{ property: Property }>> {
    const response: AxiosResponse<ApiResponse<{ property: Property }>> =
      await this.api.post("/landlord/properties", propertyData);
    return response.data;
  }

  // Landlord Tenants methods
  async getLandlordTenants(params?: {
    page?: number;
    limit?: number;
    status?: string;
    riskLevel?: string;
    search?: string;
  }): Promise<ApiResponse<{ tenants: Tenant[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ tenants: Tenant[]; pagination: any }>
    > = await this.api.get("/landlord/tenants", { params });
    return response.data;
  }

  // Landlord Guests methods
  async getLandlordGuests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    property?: string;
  }): Promise<ApiResponse<{ guests: any[]; pagination: any }>> {
    const response: AxiosResponse<
      ApiResponse<{ guests: any[]; pagination: any }>
    > = await this.api.get("/landlord/guests", { params });
    return response.data;
  }

  async createGuest(guestData: any): Promise<ApiResponse<{ guest: any }>> {
    const response: AxiosResponse<ApiResponse<{ guest: any }>> =
      await this.api.post("/guests", guestData);
    return response.data;
  }

  async createLandlordGuest(
    guestData: any
  ): Promise<ApiResponse<{ guest: any }>> {
    const response: AxiosResponse<ApiResponse<{ guest: any }>> =
      await this.api.post("/landlord/guests", guestData);
    return response.data;
  }

  async updateGuest(
    id: string,
    guestData: any
  ): Promise<ApiResponse<{ guest: any }>> {
    const response: AxiosResponse<ApiResponse<{ guest: any }>> =
      await this.api.put(`/guests/${id}`, guestData);
    return response.data;
  }

  async deleteGuest(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/guests/${id}`
    );
    return response.data;
  }

  async checkoutGuest(id: string): Promise<ApiResponse<{ guest: any }>> {
    const response: AxiosResponse<ApiResponse<{ guest: any }>> =
      await this.api.post(`/landlord/guests/${id}/checkout`);
    return response.data;
  }

  // Image management methods
  async addPropertyImage(propertyId: string, imageData: {
    imageUrl: string;
    key: string;
    originalName?: string;
    caption?: string;
    size?: number;
    mimetype?: string;
  }): Promise<ApiResponse<{ image: any; totalImages: number }>> {
    const response: AxiosResponse<ApiResponse<{ image: any; totalImages: number }>> =
      await this.api.post(`/properties/${propertyId}/images`, imageData);
    return response.data;
  }

  async removePropertyImage(propertyId: string, imageId: string): Promise<ApiResponse<{ totalImages: number }>> {
    const response: AxiosResponse<ApiResponse<{ totalImages: number }>> =
      await this.api.delete(`/properties/${propertyId}/images/${imageId}`);
    return response.data;
  }

  async updateImageCaption(propertyId: string, imageId: string, caption: string): Promise<ApiResponse<{ image: any }>> {
    const response: AxiosResponse<ApiResponse<{ image: any }>> =
      await this.api.put(`/properties/${propertyId}/images/${imageId}`, { caption });
    return response.data;
  }

  async reorderPropertyImages(propertyId: string, imageIds: string[]): Promise<ApiResponse<{ images: any[] }>> {
    const response: AxiosResponse<ApiResponse<{ images: any[] }>> =
      await this.api.put(`/properties/${propertyId}/images/reorder`, { imageIds });
    return response.data;
  }

  // Organisation endpoints
  async getOrganisations(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    plan?: string;
  }): Promise<ApiResponse<{ organisations: Organisation[]; total: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.plan) searchParams.append('plan', params.plan);
    
    const response: AxiosResponse<ApiResponse<{ organisations: Organisation[]; total: number }>> =
      await this.api.get(`/organisations?${searchParams.toString()}`);
    return response.data;
  }

  async getOrganisation(id: string): Promise<ApiResponse<{ organisation: Organisation }>> {
    const response: AxiosResponse<ApiResponse<{ organisation: Organisation }>> =
      await this.api.get(`/organisations/${id}`);
    return response.data;
  }

  async createOrganisation(data: OrganisationFormData): Promise<ApiResponse<{ organisation: Organisation }>> {
    const response: AxiosResponse<ApiResponse<{ organisation: Organisation }>> =
      await this.api.post('/organisations', data);
    return response.data;
  }

  async updateOrganisation(id: string, data: OrganisationFormData): Promise<ApiResponse<{ organisation: Organisation }>> {
    const response: AxiosResponse<ApiResponse<{ organisation: Organisation }>> =
      await this.api.put(`/organisations/${id}`, data);
    return response.data;
  }

  async toggleOrganisationStatus(id: string): Promise<ApiResponse<{ organisation: { id: string; name: string; isActive: boolean } }>> {
    const response: AxiosResponse<ApiResponse<{ organisation: { id: string; name: string; isActive: boolean } }>> =
      await this.api.patch(`/organisations/${id}/toggle-status`);
    return response.data;
  }

  async deleteOrganisation(id: string): Promise<ApiResponse<{ message: string }>> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> =
      await this.api.delete(`/organisations/${id}`);
    return response.data;
  }

  async getOrganisationStats(id: string): Promise<ApiResponse<{ organisation: any; stats: any }>> {
    const response: AxiosResponse<ApiResponse<{ organisation: any; stats: any }>> =
      await this.api.get(`/organisations/${id}/stats`);
    return response.data;
  }

  async getOrganisationUsers(id: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<{ users: User[]; total: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.status) searchParams.append('status', params.status);
    
    const response: AxiosResponse<ApiResponse<{ users: User[]; total: number }>> =
      await this.api.get(`/organisations/${id}/users?${searchParams.toString()}`);
    return response.data;
  }
}

export default new ApiService();
