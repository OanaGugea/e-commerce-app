// create lambda function
resource "aws_lambda_function" "dynamodb_lambda" {
  function_name    = "DynamoDBLambda"
  runtime         = "nodejs22.x"
  handler         = "index.handler"
  role            = aws_iam_role.lambda_exec.arn
  filename        = "${path.module}/../dist/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../dist/lambda.zip")
  // environment variables
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.items.name
    }
  }
}

// create lambda execution role
resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

// attach dynaboDB access policy to lambda execution role
resource "aws_iam_policy_attachment" "lambda_dynamodb_attach" {
  name       = "lambda_dynamodb_attachment"
  roles      = [aws_iam_role.lambda_exec.name]
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

// attach basic execution policy to lambda execution role
resource "aws_iam_role_policy_attachment" "lambda_logs_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

// allow API Gateway to invoke the lambda function
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.dynamodb_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.dynamodb_api.execution_arn}/*/*"
}
