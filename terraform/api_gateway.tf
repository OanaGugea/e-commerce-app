// create api gateway rescource
resource "aws_apigatewayv2_api" "dynamodb_api" {
  name          = "DynamoDBAPI"
  protocol_type = "HTTP"
}

// create an integration for the Lambda function
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.dynamodb_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.dynamodb_lambda.invoke_arn
}

// add a GET route
resource "aws_apigatewayv2_route" "get_items" {
  api_id    = aws_apigatewayv2_api.dynamodb_api.id
  route_key = "GET /items"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

// add a POST route
resource "aws_apigatewayv2_route" "post_items" {
  api_id    = aws_apigatewayv2_api.dynamodb_api.id
  route_key = "POST /items"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

// create a stage (Auto deploy is enabled by default)
resource "aws_apigatewayv2_stage" "dynamodb_stage" {
  api_id      = aws_apigatewayv2_api.dynamodb_api.id
  name        = "dev"
  auto_deploy = true
}

// allow API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "apigw_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.dynamodb_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.dynamodb_api.execution_arn}/*/*"
}

// output the API Gateway URL
output "api_gateway_url" {
  value = aws_apigatewayv2_api.dynamodb_api.api_endpoint
}
