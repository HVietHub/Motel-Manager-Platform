# Implementation Plan: AI Phân Tích và Dự Đoán

## Overview

Tính năng AI phân tích và dự đoán cung cấp khả năng phân tích dữ liệu thuê phòng, dự đoán doanh thu tương lai, phát hiện xu hướng theo mùa và đưa ra insights/recommendations cho chủ nhà. Implementation sử dụng TypeScript với Next.js API routes, Prisma ORM, và fast-check cho property-based testing.

## Tasks

- [x] 1. Thiết lập database schema và core types
  - Tạo Prisma migrations cho AnalyticsCache và AnalyticsAuditLog tables
  - Định nghĩa TypeScript interfaces cho tất cả data models (AnalyticsOverview, RevenuePrediction, OccupancyAnalysis, TrendAnalysis, Recommendation, etc.)
  - Tạo Zod schemas cho input validation
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [-] 2. Implement Data Aggregator service
  - [x] 2.1 Tạo DataAggregator class với các methods thu thập dữ liệu
    - Implement getContractHistory() để query contracts trong time range
    - Implement getInvoiceHistory() để query invoices trong time range
    - Implement getRoomStatistics() để lấy room stats của landlord
    - Implement aggregateMonthlyRevenue() để group invoices by month
    - Implement calculateOccupancyByPeriod() để tính occupancy theo period
    - Handle missing data và return empty arrays thay vì null
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ]* 2.2 Write property test cho Data Aggregator
    - **Property 22: Monthly Revenue Aggregation**
    - **Validates: Requirements 7.5**
    - Test rằng tổng monthly revenue bằng sum của tất cả invoices
  
  - [ ]* 2.3 Write unit tests cho Data Aggregator
    - Test empty data scenarios
    - Test time range filtering
    - Test data transformation correctness
    - _Requirements: 7.1, 7.2, 7.6_

- [x] 3. Implement Prediction Engine
  - [x] 3.1 Tạo PredictionEngine class với linear regression model
    - Implement predictRevenue() với linear regression algorithm
    - Implement calculateConfidenceInterval() cho predictions
    - Implement predictOccupancy() cho occupancy predictions
    - Implement detectAnomalies() để phát hiện outliers
    - Handle edge cases (insufficient data, negative predictions)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 3.2 Write property test cho Prediction Engine
    - **Property 5: Prediction Array Length**
    - **Validates: Requirements 2.2**
    - Test rằng số predictions trả về bằng số months requested
  
  - [ ]* 3.3 Write property test cho confidence intervals
    - **Property 6: Prediction Confidence Interval Ordering**
    - **Validates: Requirements 2.3**
    - Test rằng lowerBound <= predictedRevenue <= upperBound
  
  - [ ]* 3.4 Write property test cho revenue non-negativity
    - **Property 2: Revenue Non-Negativity**
    - **Validates: Requirements 2.4**
    - Test rằng tất cả predicted revenues >= 0
  
  - [ ]* 3.5 Write property test cho confidence bounds
    - **Property 7: Prediction Confidence Bounds**
    - **Validates: Requirements 2.5**
    - Test rằng confidence level trong [0, 100] và individual confidence trong [0, 1]
  
  - [ ]* 3.6 Write unit tests cho Prediction Engine
    - Test với known datasets để verify accuracy
    - Test insufficient data error handling
    - Test boundary values (min/max months)
    - _Requirements: 2.1, 2.6, 2.7_

- [ ] 4. Checkpoint - Ensure core data và prediction logic hoạt động
  - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Implement Analytics Service - Core calculations
  - [x] 5.1 Tạo AnalyticsService class với occupancy calculations
    - Implement calculateOccupancyRate() với validation bounds [0, 100]
    - Implement calculateRevenueMetrics() để tính total revenue và growth
    - Ensure occupied rooms <= total rooms constraint
    - _Requirements: 1.2, 1.3, 1.4, 3.2, 3.5_
  
  - [ ]* 5.2 Write property test cho occupancy rate bounds
    - **Property 1: Occupancy Rate Bounds**
    - **Validates: Requirements 1.2, 3.2**
    - Test rằng occupancy rate luôn trong [0, 100]
  
  - [ ]* 5.3 Write property test cho occupied rooms constraint
    - **Property 11: Occupied Rooms Constraint**
    - **Validates: Requirements 3.5, 12.5**
    - Test rằng occupied rooms <= total rooms
  
  - [x] 5.4 Implement seasonal pattern detection
    - Implement detectSeasonalPatterns() để group data by season
    - Validate seasonal grouping correctness (spring: 3-5, summer: 6-8, fall: 9-11, winter: 12,1-2)
    - Exclude seasons với no data
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 5.5 Write property test cho seasonal patterns
    - **Property 12: Seasonal Pattern Bounds**
    - **Validates: Requirements 4.2, 4.3, 4.4**
    - Test rằng có tối đa 4 patterns và averages non-negative
  
  - [ ]* 5.6 Write property test cho seasonal grouping
    - **Property 13: Seasonal Grouping Correctness**
    - **Validates: Requirements 4.2**
    - Test rằng months được group vào đúng season
  
  - [ ]* 5.7 Write unit tests cho Analytics Service calculations
    - Test empty data scenarios (no rooms, no contracts)
    - Test edge cases (0% occupancy, 100% occupancy)
    - Test seasonal pattern với insufficient data
    - _Requirements: 1.4, 3.4, 4.1_

- [ ] 6. Implement Analytics Service - Overview generation
  - [x] 6.1 Implement getOverview() method
    - Orchestrate data aggregation từ DataAggregator
    - Calculate all metrics (occupancy, revenue, growth, trend)
    - Include timestamp trong response
    - Filter data theo time range
    - _Requirements: 1.1, 1.5, 1.6_
  
  - [ ]* 6.2 Write property test cho analytics overview completeness
    - **Property 3: Analytics Overview Completeness**
    - **Validates: Requirements 1.1, 1.6**
    - Test rằng overview chứa tất cả required fields
  
  - [ ]* 6.3 Write property test cho time range filtering
    - **Property 4: Time Range Filtering**
    - **Validates: Requirements 1.5, 7.1, 7.2**
    - Test rằng data được filter đúng theo time range
  
  - [ ]* 6.4 Write unit tests cho getOverview()
    - Test với various time ranges
    - Test với landlord có no data
    - Test timestamp generation
    - _Requirements: 1.4, 1.5, 1.6_

- [-] 7. Implement Insights Generator
  - [x] 7.1 Tạo InsightsGenerator class với insight rules
    - Implement analyzeRevenueGrowth() để detect growth/decline patterns
    - Implement identifyPeakPeriods() để find peak occupancy periods
    - Implement generateInsights() với rules cho occupancy và revenue
    - Validate insight types và impact levels
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 7.2 Implement recommendations generation
    - Implement generateRecommendations() với priority assignment
    - Sort recommendations by priority (high → medium → low)
    - Include action items cho actionable recommendations
    - Track basedOn data points cho traceability
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 7.3 Write property test cho insight validity
    - **Property 15: Insight Type and Impact Validity**
    - **Validates: Requirements 5.6**
    - Test rằng insights có valid type và impact
  
  - [ ]* 7.4 Write property test cho recommendation priority
    - **Property 16: Recommendation Priority Validity**
    - **Property 17: Recommendation Priority Ordering**
    - **Validates: Requirements 6.1, 6.2**
    - Test rằng recommendations có valid priority và được sort đúng
  
  - [ ]* 7.5 Write property test cho recommendation completeness
    - **Property 18: Recommendation Completeness**
    - **Property 19: Actionable Recommendation Structure**
    - **Property 20: Recommendation Traceability**
    - **Validates: Requirements 6.3, 6.4, 6.5**
    - Test rằng recommendations có đủ fields và action items
  
  - [ ]* 7.6 Write unit tests cho Insights Generator
    - Test insight generation với various metric combinations
    - Test empty insights khi no patterns detected
    - Test recommendation generation logic
    - _Requirements: 5.7, 6.6_

- [ ] 8. Checkpoint - Ensure analytics và insights logic hoạt động
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement caching layer
  - [ ] 9.1 Tạo CacheService với Redis hoặc in-memory cache
    - Implement cache key generation (analytics:{landlordId}:{timeRange.hash})
    - Implement cache get/set operations với TTL 1 hour
    - Implement cache invalidation logic
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 9.2 Integrate caching vào Analytics Service
    - Check cache trước khi query database
    - Return cached data nếu valid
    - Invalidate cache khi có new contracts/invoices
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [ ]* 9.3 Write property test cho cache behavior
    - **Property 26: Cache Check Before Query**
    - **Property 27: Cache Hit Returns Cached Data**
    - **Validates: Requirements 9.1, 9.2**
    - Test rằng cache được check trước database query
  
  - [ ]* 9.4 Write unit tests cho caching
    - Test cache hit/miss scenarios
    - Test cache expiration
    - Test cache invalidation
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 10. Implement API routes
  - [x] 10.1 Tạo GET /api/analytics/overview endpoint
    - Validate landlord authentication và authorization
    - Parse và validate query parameters (timeRange)
    - Call AnalyticsService.getOverview()
    - Return formatted response
    - _Requirements: 1.1, 8.1, 8.2, 8.3_
  
  - [x] 10.2 Tạo GET /api/analytics/predictions endpoint
    - Validate landlord authentication
    - Parse và validate months parameter [1, 24]
    - Call AnalyticsService.predictFutureRevenue()
    - Handle insufficient data errors
    - _Requirements: 2.1, 2.6, 2.7, 8.1_
  
  - [x] 10.3 Tạo GET /api/analytics/occupancy endpoint
    - Validate landlord authentication
    - Parse và validate timeRange parameter
    - Call AnalyticsService.getOccupancyAnalysis()
    - Return peak và low periods
    - _Requirements: 3.1, 3.4, 8.1_
  
  - [x] 10.4 Tạo GET /api/analytics/trends endpoint
    - Validate landlord authentication
    - Call AnalyticsService.detectSeasonalPatterns()
    - Handle insufficient data errors
    - _Requirements: 4.1, 8.1_
  
  - [x] 10.5 Tạo GET /api/analytics/recommendations endpoint
    - Validate landlord authentication
    - Call InsightsGenerator.generateRecommendations()
    - Return sorted recommendations
    - _Requirements: 6.1, 6.2, 8.1_
  
  - [ ]* 10.6 Write unit tests cho API routes
    - Test authentication và authorization
    - Test input validation
    - Test error responses
    - _Requirements: 8.1, 8.2, 8.3, 12.6_

- [ ] 11. Implement error handling và validation
  - [ ] 11.1 Tạo error handler middleware cho analytics APIs
    - Handle 404 Not Found (landlord not exists)
    - Handle 400 Bad Request (validation errors)
    - Handle 403 Forbidden (authorization errors)
    - Handle 503 Service Unavailable (database timeout)
    - Handle 429 Too Many Requests (rate limit)
    - _Requirements: 10.1, 10.2, 10.3, 8.2, 8.6_
  
  - [ ] 11.2 Implement input validation với Zod
    - Validate landlordId (not null, not empty)
    - Validate timeRange (startDate <= endDate)
    - Validate prediction months [1, 24]
    - Validate revenue values (non-negative)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.6_
  
  - [ ] 11.3 Implement fallback prediction logic
    - Detect prediction model failures
    - Calculate simple average fallback
    - Log errors với context
    - _Requirements: 10.4, 10.5_
  
  - [ ]* 11.4 Write property test cho input validation
    - **Property 36: Input Validation**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**
    - Test rằng invalid inputs được reject
  
  - [ ]* 11.5 Write property test cho validation error responses
    - **Property 37: Validation Error Response**
    - **Validates: Requirements 12.6**
    - Test rằng validation errors return 400 với messages
  
  - [ ]* 11.6 Write unit tests cho error handling
    - Test all error scenarios
    - Test error logging
    - Test error response format (no stack traces)
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6_

- [ ] 12. Implement audit logging
  - [ ] 12.1 Tạo AuditLogService để log analytics requests
    - Implement logRequest() để save audit logs
    - Include landlordId, action, parameters, timestamp
    - Include responseTime và success flag
    - Anonymize sensitive data trong logs
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 8.5_
  
  - [ ] 12.2 Integrate audit logging vào API routes
    - Log mỗi analytics request
    - Log response time
    - Log errors với success=false
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ] 12.3 Implement audit log cleanup job
    - Create background job để delete old logs
    - Support filtering by landlordId và date range
    - _Requirements: 11.5, 11.6_
  
  - [ ]* 12.4 Write property test cho audit logging
    - **Property 33: Audit Log Completeness**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
    - Test rằng audit logs chứa tất cả required fields
  
  - [ ]* 12.5 Write unit tests cho audit logging
    - Test log creation
    - Test log filtering
    - Test log cleanup
    - _Requirements: 11.1, 11.5, 11.6_

- [ ] 13. Implement security và authorization
  - [ ] 13.1 Add authorization checks vào tất cả API routes
    - Verify landlordId matches authenticated user
    - Block tenant access to analytics features
    - Return 403 Forbidden cho unauthorized access
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 13.2 Implement rate limiting middleware
    - Limit to 10 requests per minute per landlord
    - Return 429 Too Many Requests khi exceeded
    - _Requirements: 8.6_
  
  - [ ] 13.3 Ensure data privacy trong responses
    - Không expose individual tenant financial data
    - Aggregate data only
    - Anonymize data trong error messages
    - _Requirements: 8.4, 8.5_
  
  - [ ]* 13.4 Write property test cho authorization
    - **Property 23: Authorization Verification**
    - **Validates: Requirements 8.1**
    - Test rằng landlordId matches authenticated user
  
  - [ ]* 13.5 Write property test cho data privacy
    - **Property 24: Tenant Data Privacy**
    - **Validates: Requirements 8.4**
    - Test rằng responses không chứa tenant PII
  
  - [ ]* 13.6 Write unit tests cho security
    - Test authorization checks
    - Test rate limiting
    - Test data anonymization
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 14. Checkpoint - Ensure security và error handling hoạt động
  - Ensure all tests pass, ask the user if questions arise.

- [-] 15. Create frontend components
  - [x] 15.1 Tạo AnalyticsDashboard component
    - Display analytics overview (occupancy, revenue, growth)
    - Show charts cho historical data
    - Display insights và recommendations
    - Handle loading và error states
    - _Requirements: 1.1, 5.1, 6.1_
  
  - [ ] 15.2 Tạo RevenuePredictionChart component
    - Display predicted revenue với confidence intervals
    - Show historical data for comparison
    - Display confidence level
    - _Requirements: 2.2, 2.3, 2.5_
  
  - [ ] 15.3 Tạo OccupancyAnalysisChart component
    - Display occupancy rate over time
    - Highlight peak và low periods
    - Show trend direction
    - _Requirements: 3.1, 3.3_
  
  - [ ] 15.4 Tạo SeasonalPatternsChart component
    - Display seasonal patterns với bar/line chart
    - Show averages cho each season
    - _Requirements: 4.2, 4.3_
  
  - [ ] 15.5 Tạo RecommendationsList component
    - Display recommendations sorted by priority
    - Show action items cho each recommendation
    - Allow marking action items as completed
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 15.6 Write unit tests cho frontend components
    - Test component rendering
    - Test data display
    - Test error handling
    - _Requirements: 1.1, 2.2, 3.1, 4.2, 6.1_

- [-] 16. Add analytics page to landlord dashboard
  - [x] 16.1 Tạo /landlord/analytics page
    - Integrate AnalyticsDashboard component
    - Add time range selector
    - Add tabs cho different analytics views
    - Implement data fetching với SWR hoặc React Query
    - _Requirements: 1.1, 1.5_
  
  - [x] 16.2 Add navigation link to analytics page
    - Update landlord sidebar với analytics link
    - Add icon và label
    - _Requirements: 1.1_
  
  - [ ]* 16.3 Write integration tests cho analytics page
    - Test page rendering
    - Test data fetching
    - Test user interactions
    - _Requirements: 1.1, 1.5_

- [ ] 17. Performance optimization
  - [ ] 17.1 Add database indexes
    - Add index on Contract(landlordId, startDate, endDate, status)
    - Add index on Invoice(tenantId, year, month, status)
    - Add index on Room(buildingId, status)
    - Add index on AnalyticsCache(landlordId, expiresAt)
    - Add index on AnalyticsAuditLog(landlordId, createdAt)
    - _Requirements: 9.5, 9.6_
  
  - [ ] 17.2 Optimize database queries
    - Use Prisma select để fetch only needed fields
    - Implement pagination cho large datasets
    - Use database views cho complex aggregations
    - _Requirements: 9.5, 9.6, 9.7_
  
  - [ ]* 17.3 Write performance tests
    - Test response times (overview < 500ms, predictions < 1s, complete report < 3s)
    - Test với large datasets
    - Test concurrent requests
    - _Requirements: 9.5, 9.6, 9.7_

- [ ] 18. Final integration và testing
  - [ ] 18.1 Run full integration tests
    - Test complete workflow từ API call đến response
    - Test với multiple landlords simultaneously
    - Test cache behavior end-to-end
    - Test error scenarios với real database
    - _Requirements: All_
  
  - [ ]* 18.2 Write property-based integration tests
    - **Property 8: Minimum Data Requirements**
    - **Property 10: Peak and Low Period Ordering**
    - **Property 14: Empty Season Exclusion**
    - Test system-wide invariants
  
  - [ ] 18.3 Verify all requirements coverage
    - Review requirements document
    - Ensure all acceptance criteria met
    - Document any deviations
    - _Requirements: All_

- [ ] 19. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked với `*` là optional và có thể skip cho faster MVP
- Mỗi task references specific requirements để traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples và edge cases
- Implementation sử dụng TypeScript với Next.js, Prisma, và fast-check
- Caching layer có thể dùng Redis hoặc in-memory cache
- Frontend components sử dụng React với chart libraries (recharts hoặc chart.js)
