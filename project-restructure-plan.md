# Kế hoạch tái cấu trúc dự án Dashboard

## 1. Cấu trúc thư mục mới

```
src/
├── app/                      # Application layer
│   ├── App.tsx
│   ├── providers/           # Context providers
│   │   ├── ThemeProvider.tsx
│   │   └── AuthProvider.tsx
│   └── routes/              # Routing configuration
│       ├── index.tsx
│       └── PrivateRoute.tsx
│
├── features/                # Feature-based modules
│   ├── dashboard/
│   │   ├── components/      # Feature-specific components
│   │   │   ├── overview/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── HighlightedCard.tsx
│   │   │   │   └── index.ts
│   │   │   ├── charts/
│   │   │   │   ├── SessionsChart.tsx
│   │   │   │   ├── PageViewsBarChart.tsx
│   │   │   │   ├── ChartUserByCountry.tsx
│   │   │   │   └── index.ts
│   │   │   └── data-grid/
│   │   │       ├── CustomizedDataGrid.tsx
│   │   │       └── index.ts
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   ├── hooks/           # Feature-specific hooks
│   │   │   ├── useDashboardData.ts
│   │   │   └── useChartData.ts
│   │   ├── services/        # API services
│   │   │   └── dashboardService.ts
│   │   ├── types/           # TypeScript types
│   │   │   └── dashboard.types.ts
│   │   └── index.ts
│   │
│   ├── auth/                # Authentication feature
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   └── users/               # Users management feature
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       └── types/
│
├── shared/                  # Shared resources
│   ├── components/          # Shared UI components
│   │   ├── layout/
│   │   │   ├── AppNavbar.tsx
│   │   │   ├── SideMenu.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── ui/              # Generic UI components
│   │   │   ├── Search.tsx
│   │   │   ├── MenuButton.tsx
│   │   │   ├── CustomDatePicker.tsx
│   │   │   └── ColorModeIconDropdown.tsx
│   │   └── feedback/
│   │       └── CardAlert.tsx
│   │
│   ├── hooks/               # Shared hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── services/            # Shared services
│   │   ├── api/
│   │   │   ├── apiClient.ts
│   │   │   └── endpoints.ts
│   │   └── storage/
│   │       └── localStorage.ts
│   │
│   ├── theme/               # Theme configuration
│   │   ├── themePrimitives.ts
│   │   ├── customizations/
│   │   │   ├── charts.ts
│   │   │   ├── dataGrid.ts
│   │   │   ├── inputs.ts
│   │   │   └── index.ts
│   │   └── AppTheme.tsx
│   │
│   ├── types/               # Shared types
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   │
│   └── utils/               # Utility functions
│       ├── formatters.ts
│       ├── validators.ts
│       └── constants.ts
│
├── assets/                  # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── styles/                  # Global styles
│   ├── index.css
│   └── globals.css
│
└── main.tsx                 # Entry point
```

## 2. Nguyên tắc tổ chức

### 2.1 Feature-based Architecture
- Mỗi feature độc lập với structure riêng
- Dễ dàng thêm/xóa features
- Code liên quan được nhóm lại với nhau

### 2.2 Separation of Concerns
- Business logic tách biệt khỏi UI
- Services handle API calls
- Hooks manage state và side effects
- Components chỉ focus vào rendering

### 2.3 Type Safety
- Định nghĩa types cho mọi data structures
- Sử dụng generics cho reusable components
- Strict TypeScript configuration

## 3. Các cải tiến cụ thể

### 3.1 State Management
```typescript
// Sử dụng Context API hoặc Zustand cho global state
// features/dashboard/store/dashboardStore.ts
interface DashboardState {
  stats: StatData[];
  charts: ChartData;
  isLoading: boolean;
  error: Error | null;
}
```

### 3.2 API Layer
```typescript
// shared/services/api/apiClient.ts
class ApiClient {
  private baseURL: string;
  
  async get<T>(endpoint: string): Promise<T> {
    // Implementation with error handling
  }
  
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    // Implementation
  }
}
```

### 3.3 Custom Hooks
```typescript
// features/dashboard/hooks/useDashboardData.ts
export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Fetch data logic
  }, []);
  
  return { data, loading, error, refetch };
};
```

### 3.4 Component Patterns
```typescript
// Compound Component Pattern cho complex components
// Container/Presentational pattern
// Render props hoặc custom hooks cho logic sharing
```

## 4. Performance Optimizations

### 4.1 Code Splitting
- Lazy load features
- Dynamic imports cho heavy components
- Route-based code splitting

### 4.2 Memoization
- React.memo cho pure components
- useMemo/useCallback cho expensive operations
- Virtualization cho large lists

### 4.3 Bundle Optimization
- Tree shaking
- Chunk splitting
- Asset optimization

## 5. Testing Structure

```
src/
├── features/
│   └── dashboard/
│       ├── __tests__/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── services/
│       └── __mocks__/
```

## 6. Documentation

### 6.1 Component Documentation
- JSDoc comments
- Storybook for component library
- README files per feature

### 6.2 API Documentation
- OpenAPI/Swagger integration
- Type definitions from API schema

## 7. Development Workflow

### 7.1 Git Flow
```
main
├── develop
│   ├── feature/dashboard-refactor
│   ├── feature/auth-implementation
│   └── feature/user-management
└── release/v1.0.0
```

### 7.2 CI/CD Pipeline
- Linting và formatting checks
- Unit và integration tests
- Build optimization
- Automated deployment

## 8. Configuration Files

### 8.1 Environment Variables
```
.env
.env.development
.env.production
.env.test
```

### 8.2 Build Configuration
- Vite config optimization
- Path aliases
- Environment-specific builds

## 9. Migration Plan

### Phase 1: Core Structure (1-2 days)
1. Setup new folder structure
2. Move shared components
3. Configure path aliases

### Phase 2: Feature Migration (3-4 days)
1. Migrate dashboard feature
2. Implement proper data flow
3. Add tests

### Phase 3: Optimization (2-3 days)
1. Performance improvements
2. Bundle optimization
3. Documentation

### Phase 4: Enhancement (Ongoing)
1. Add new features
2. Improve existing components
3. Scale architecture

## 10. Best Practices

### 10.1 Naming Conventions
- PascalCase: Components, Types
- camelCase: functions, variables
- kebab-case: file names
- UPPER_CASE: constants

### 10.2 Import Order
1. External libraries
2. Internal aliases
3. Relative imports
4. Types
5. Styles

### 10.3 Component Structure
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Styled Components
// 4. Helper Functions
// 5. Main Component
// 6. Export
```

This restructuring will make the project more maintainable, scalable, and easier to work with for team collaboration.