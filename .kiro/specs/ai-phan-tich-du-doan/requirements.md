# Requirements Document: AI Phân Tích và Dự Đoán

## Introduction

Tính năng AI phân tích và dự đoán cung cấp cho chủ nhà khả năng phân tích dữ liệu thuê phòng lịch sử, dự đoán doanh thu tương lai, phát hiện xu hướng theo mùa và nhận insights/recommendations có giá trị. Hệ thống sử dụng machine learning models để xử lý dữ liệu từ contracts, invoices, rooms và tạo ra các báo cáo phân tích giúp chủ nhà đưa ra quyết định kinh doanh tốt hơn.

## Glossary

- **Analytics_Service**: Service chính xử lý business logic cho analytics và predictions
- **Data_Aggregator**: Component thu thập và tổng hợp dữ liệu từ database
- **Prediction_Engine**: Component chứa machine learning models để dự đoán revenue và trends
- **Insights_Generator**: Component phân tích patterns và tạo recommendations
- **Landlord**: Chủ nhà sử dụng hệ thống để quản lý properties
- **Occupancy_Rate**: Tỷ lệ phòng đang được thuê so với tổng số phòng (%)
- **Time_Range**: Khoảng thời gian có startDate và endDate
- **Seasonal_Pattern**: Pattern theo mùa (spring, summer, fall, winter)
- **Confidence_Interval**: Khoảng tin cậy cho predictions (lowerBound, upperBound)
- **Historical_Data**: Dữ liệu lịch sử về contracts, invoices, occupancy
- **Revenue_Prediction**: Dự đoán doanh thu tương lai với confidence levels
- **Insight**: Phân tích có giá trị về business metrics
- **Recommendation**: Đề xuất hành động cụ thể để cải thiện business

## Requirements

### Requirement 1: Analytics Overview

**User Story:** As a landlord, I want to view an analytics overview of my properties, so that I can understand current performance metrics.

#### Acceptance Criteria

1. WHEN a landlord requests analytics overview THEN THE Analytics_Service SHALL return occupancy rate, total revenue, average room price, revenue growth, and occupancy trend
2. WHEN calculating occupancy rate THEN THE Analytics_Service SHALL ensure the result is between 0 and 100 percent
3. WHEN calculating total revenue THEN THE Analytics_Service SHALL ensure the result is non-negative
4. WHEN the landlord has no rooms THEN THE Analytics_Service SHALL return occupancy rate of 0
5. WHERE a time range is specified THEN THE Analytics_Service SHALL filter data within that time range
6. WHEN generating the overview THEN THE Analytics_Service SHALL include a timestamp indicating when the report was generated

### Requirement 2: Revenue Prediction

**User Story:** As a landlord, I want to predict future revenue, so that I can plan my finances and investments.

#### Acceptance Criteria

1. WHEN a landlord requests revenue prediction THEN THE Prediction_Engine SHALL require at least 3 months of historical data
2. WHEN predicting revenue THEN THE Prediction_Engine SHALL generate predictions for the requested number of months (1 to 24)
3. WHEN generating predictions THEN THE Prediction_Engine SHALL ensure each prediction has a lower bound, predicted value, and upper bound where lowerBound ≤ predictedRevenue ≤ upperBound
4. WHEN calculating predictions THEN THE Prediction_Engine SHALL ensure all predicted revenue values are non-negative
5. WHEN generating predictions THEN THE Prediction_Engine SHALL calculate a confidence level between 0 and 100 percent
6. WHEN the landlord has insufficient data (less than 3 months) THEN THE Analytics_Service SHALL return an error message "Insufficient data for analysis. Minimum 3 months required."
7. WHEN the requested prediction months is outside the range [1, 24] THEN THE Analytics_Service SHALL return a validation error

### Requirement 3: Occupancy Analysis

**User Story:** As a landlord, I want to analyze occupancy patterns over time, so that I can identify peak and low periods.

#### Acceptance Criteria

1. WHEN a landlord requests occupancy analysis THEN THE Analytics_Service SHALL return current occupancy rate, historical data points, average occupancy, peak period, and low period
2. WHEN calculating occupancy for any data point THEN THE Analytics_Service SHALL ensure occupancy rate is between 0 and 100 percent
3. WHEN identifying peak and low periods THEN THE Analytics_Service SHALL ensure peak period average rate is greater than or equal to low period average rate
4. WHEN historical data has fewer than 3 data points THEN THE Analytics_Service SHALL return an error indicating insufficient data
5. WHEN calculating occupancy THEN THE Analytics_Service SHALL ensure occupied rooms never exceeds total rooms

### Requirement 4: Seasonal Pattern Detection

**User Story:** As a landlord, I want to detect seasonal patterns in occupancy and revenue, so that I can adjust pricing and marketing strategies accordingly.

#### Acceptance Criteria

1. WHEN a landlord requests seasonal pattern analysis THEN THE Analytics_Service SHALL require at least 12 months of historical data
2. WHEN detecting patterns THEN THE Analytics_Service SHALL group data into four seasons: spring (months 3-5), summer (months 6-8), fall (months 9-11), winter (months 12, 1-2)
3. WHEN calculating seasonal averages THEN THE Analytics_Service SHALL ensure average occupancy and average revenue are non-negative
4. WHEN returning seasonal patterns THEN THE Analytics_Service SHALL return at most 4 patterns (one per season)
5. WHEN a season has no data THEN THE Analytics_Service SHALL exclude that season from the results

### Requirement 5: Insights Generation

**User Story:** As a landlord, I want to receive automated insights about my property performance, so that I can identify issues and opportunities.

#### Acceptance Criteria

1. WHEN occupancy rate is below 70% THEN THE Insights_Generator SHALL create a warning insight with high impact and actionable flag set to true
2. WHEN occupancy rate is above 90% THEN THE Insights_Generator SHALL create a positive insight with high impact
3. WHEN revenue growth is less than -5% THEN THE Insights_Generator SHALL create a negative insight with high impact and actionable flag set to true
4. WHEN revenue growth is greater than 10% THEN THE Insights_Generator SHALL create a positive insight with medium impact
5. WHEN prediction confidence level is below 60% THEN THE Insights_Generator SHALL create a warning insight about low confidence
6. WHEN generating insights THEN THE Insights_Generator SHALL ensure each insight has a valid type (positive, negative, neutral, warning) and impact level (high, medium, low)
7. WHEN no significant patterns are detected THEN THE Insights_Generator SHALL return an empty insights array

### Requirement 6: Recommendations Generation

**User Story:** As a landlord, I want to receive actionable recommendations, so that I can improve my property performance.

#### Acceptance Criteria

1. WHEN generating recommendations THEN THE Insights_Generator SHALL assign each recommendation a priority (high, medium, low)
2. WHEN returning recommendations THEN THE Insights_Generator SHALL sort them by priority with high priority first
3. WHEN creating a recommendation THEN THE Insights_Generator SHALL include a title, description, expected impact, and at least one action item
4. WHEN a recommendation is actionable THEN THE Insights_Generator SHALL provide specific action items with descriptions
5. WHEN generating recommendations THEN THE Insights_Generator SHALL base each recommendation on specific data points or insights
6. WHEN no actionable recommendations can be generated THEN THE Insights_Generator SHALL return an empty recommendations array

### Requirement 7: Data Aggregation

**User Story:** As a system, I need to aggregate data efficiently from the database, so that analytics can be computed quickly.

#### Acceptance Criteria

1. WHEN aggregating contract history THEN THE Data_Aggregator SHALL filter contracts where the contract period overlaps with the specified time range
2. WHEN aggregating invoice history THEN THE Data_Aggregator SHALL filter invoices where the invoice date falls within the specified time range
3. WHEN querying room statistics THEN THE Data_Aggregator SHALL return current status of all rooms for the landlord
4. WHEN aggregating data THEN THE Data_Aggregator SHALL handle missing data gracefully without throwing errors
5. WHEN calculating monthly revenue THEN THE Data_Aggregator SHALL group invoices by month and sum the amounts
6. WHEN the landlord has no data THEN THE Data_Aggregator SHALL return empty arrays rather than null values

### Requirement 8: Authorization and Security

**User Story:** As a system administrator, I want to ensure landlords can only access their own analytics data, so that data privacy is maintained.

#### Acceptance Criteria

1. WHEN a landlord requests analytics THEN THE Analytics_Service SHALL verify the landlord ID matches the authenticated user
2. WHEN a landlord attempts to access another landlord's data THEN THE Analytics_Service SHALL return a 403 Forbidden error
3. WHEN a tenant attempts to access analytics features THEN THE Analytics_Service SHALL return a 403 Forbidden error
4. WHEN processing analytics requests THEN THE Analytics_Service SHALL not expose individual tenant financial data
5. WHEN logging analytics requests THEN THE Analytics_Service SHALL anonymize sensitive data in logs
6. WHEN rate limit is exceeded (more than 10 requests per minute) THEN THE Analytics_Service SHALL return a 429 Too Many Requests error

### Requirement 9: Caching and Performance

**User Story:** As a landlord, I want analytics to load quickly, so that I can make timely decisions.

#### Acceptance Criteria

1. WHEN analytics data is requested THEN THE Analytics_Service SHALL check the cache before querying the database
2. WHEN cached data exists and is not expired THEN THE Analytics_Service SHALL return cached data
3. WHEN cached data is older than 1 hour THEN THE Analytics_Service SHALL invalidate the cache and fetch fresh data
4. WHEN a new contract or invoice is created THEN THE Analytics_Service SHALL invalidate the relevant landlord's analytics cache
5. WHEN generating analytics overview THEN THE Analytics_Service SHALL complete the request in less than 500 milliseconds
6. WHEN generating revenue predictions THEN THE Analytics_Service SHALL complete the request in less than 1 second
7. WHEN generating complete analytics report THEN THE Analytics_Service SHALL complete the request in less than 3 seconds

### Requirement 10: Error Handling

**User Story:** As a landlord, I want clear error messages when analytics cannot be generated, so that I understand what went wrong.

#### Acceptance Criteria

1. WHEN the landlord ID does not exist THEN THE Analytics_Service SHALL return a 404 Not Found error
2. WHEN the time range is invalid (startDate > endDate) THEN THE Analytics_Service SHALL return a 400 Bad Request error with validation details
3. WHEN the database query times out THEN THE Analytics_Service SHALL return a 503 Service Unavailable error with retry-after header
4. WHEN the prediction model fails THEN THE Analytics_Service SHALL log the error and return a fallback prediction based on simple average
5. WHEN any error occurs THEN THE Analytics_Service SHALL log the error with context (landlord ID, request parameters, timestamp)
6. WHEN returning errors THEN THE Analytics_Service SHALL not expose internal system details or stack traces to the client

### Requirement 11: Audit Logging

**User Story:** As a system administrator, I want to track all analytics requests, so that I can monitor usage and detect anomalies.

#### Acceptance Criteria

1. WHEN a landlord requests analytics THEN THE Analytics_Service SHALL log the request with landlord ID, action type, parameters, and timestamp
2. WHEN an analytics request completes THEN THE Analytics_Service SHALL log the response time in milliseconds
3. WHEN an analytics request fails THEN THE Analytics_Service SHALL log the error message and success flag set to false
4. WHEN logging requests THEN THE Analytics_Service SHALL store logs in the AnalyticsAuditLog table
5. WHEN querying audit logs THEN THE Analytics_Service SHALL support filtering by landlord ID and date range
6. WHEN audit logs are older than the retention period THEN THE Analytics_Service SHALL automatically delete them

### Requirement 12: Data Validation

**User Story:** As a system, I need to validate all input data, so that analytics calculations are accurate and reliable.

#### Acceptance Criteria

1. WHEN receiving a landlord ID THEN THE Analytics_Service SHALL verify it is not null and not empty
2. WHEN receiving a time range THEN THE Analytics_Service SHALL verify startDate is less than or equal to endDate
3. WHEN receiving prediction months parameter THEN THE Analytics_Service SHALL verify it is between 1 and 24
4. WHEN processing historical data THEN THE Analytics_Service SHALL verify all revenue values are non-negative
5. WHEN processing room data THEN THE Analytics_Service SHALL verify occupied rooms does not exceed total rooms
6. WHEN validation fails THEN THE Analytics_Service SHALL return a 400 Bad Request error with specific validation error messages

