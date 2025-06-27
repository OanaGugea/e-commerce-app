// create api gateway rescource
resource "aws_apigatewayv2_api" "dynamodb_api" {
  name          = "DynamoDBAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type"]
  }
}

// create an integration for the Lambda function
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.dynamodb_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${aws_lambda_function.dynamodb_lambda.arn}/invocations"

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

// add a PUT route
resource "aws_apigatewayv2_route" "put_items" {
  api_id    = aws_apigatewayv2_api.dynamodb_api.id
  route_key = "PUT /items"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

// add a DELETE route
resource "aws_apigatewayv2_route" "delete_items" {
  api_id    = aws_apigatewayv2_api.dynamodb_api.id
  route_key = "DELETE /items"
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
