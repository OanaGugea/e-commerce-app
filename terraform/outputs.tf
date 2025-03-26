output "api_gateway_url" {
  description = "Base URL of API Gateway"
  value       = aws_api_gateway_deployment.dynamodb_api_deployment.invoke_url
}
